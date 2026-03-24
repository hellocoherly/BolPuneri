import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/auth"
import { FieldValue } from "firebase-admin/firestore"

const AI_DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || "10")

// Curated content templates for MVP (before real AI integration)
const TEMPLATES: Record<string, Record<string, { marathi: string; english: string }[]>> = {
  PATYA: {
    HUMOROUS: [
      { marathi: "आमचं काही चुकलं असेल तर सांगा, पण हळू सांगा... आम्ही पुणेकर आहोत, लगेच सुधारणार नाही!", english: "If we've done something wrong, tell us softly... we're Punekars, we won't improve immediately!" },
      { marathi: "पुण्यात रस्ता विचारू नका, पुणेकर रस्ता सांगतात पण पोहोचवत नाहीत!", english: "Don't ask for directions in Pune, Punekars give directions but won't take you there!" },
      { marathi: "इथे सगळे विद्वान आहेत, फक्त ऐकणारे कोणी नाहीत!", english: "Everyone here is a scholar, there's just nobody to listen!" },
      { marathi: "आमचं प्रेम शांत आहे, पण आमचा हॉर्न नाही!", english: "Our love is quiet, but our horn is not!" },
      { marathi: "पुणेरी पाटी: कृपया इथे थांबू नका, तुमच्यामुळे ट्रॅफिक होतो आणि आम्हाला उशीर होतो!", english: "Puneri sign: Please don't stop here, you cause traffic and we get late!" },
    ],
    ROMANTIC: [
      { marathi: "तुझ्या डोळ्यांत पाहिलं आणि पुण्याचा ट्रॅफिक विसरलो!", english: "I looked into your eyes and forgot Pune's traffic!" },
      { marathi: "तू माझ्या आयुष्यातला सह्याद्री आहेस - कधी कठीण, पण नेहमी सुंदर!", english: "You're the Sahyadri of my life - sometimes tough, but always beautiful!" },
      { marathi: "तुझ्याशिवाय पुणे म्हणजे वडापाव शिवाय स्टेशन!", english: "Pune without you is like a station without vada pav!" },
    ],
    PHILOSOPHICAL: [
      { marathi: "जगात दोनच गोष्टी अनंत आहेत: विश्व आणि पुणेकरांचा अहंकार!", english: "Only two things are infinite: the universe and a Punekar's ego!" },
      { marathi: "यश मिळवायचं असेल तर पुणेकरासारखा विचार करा - सगळ्यांना चुकीचं सिद्ध करा!", english: "Want success? Think like a Punekar - prove everyone wrong!" },
    ],
    SARCASTIC: [
      { marathi: "हो हो, तुम्हीच बरोबर! आम्ही पुणेकर उगाच बोलतो!", english: "Yes yes, you're right! We Punekars speak for no reason!" },
      { marathi: "सल्ला फुकट, अंमलबजावणी तुमची जबाबदारी!", english: "Advice is free, implementation is your responsibility!" },
      { marathi: "आमचं ऐकलं असतं तर हे झालं नसतं, पण कोण ऐकतो आम्हाला!", english: "If you had listened to us this wouldn't have happened, but who listens to us!" },
    ],
    GENERAL: [
      { marathi: "पुणे म्हणजे पुणे - बाकी सगळे उपनगर!", english: "Pune is Pune - everything else is a suburb!" },
      { marathi: "एक पुणेकर दहा सल्ले देतो, पण एकही स्वतः पाळत नाही!", english: "One Punekar gives ten advices but follows none himself!" },
    ],
  },
  UKHANE: {
    HUMOROUS: [
      { marathi: "___चं नाव घेते, लाजत लाजत, पुण्यात traffic मध्ये भेटलो आम्ही हसत हसत!", english: "Taking ___'s name shyly, we met in Pune's traffic, laughing!" },
      { marathi: "___चं नाव घेते मोठ्या आवाजात, पुणेकर आहोत आम्ही, बोलतो सगळ्यांच्या कानात!", english: "Taking ___'s name loudly, we're Punekars, we speak in everyone's ears!" },
    ],
    ROMANTIC: [
      { marathi: "___चं नाव घेते ओठांवरती, तुमच्यावीण जगणं कठीण या जगती!", english: "Taking ___'s name on my lips, living without you is hard in this world!" },
      { marathi: "___चं नाव घेते फुलांच्या बागेत, तुम्हीच माझे सर्वस्व या जन्मात आणि मागेत!", english: "Taking ___'s name in a flower garden, you are my everything in this and past life!" },
      { marathi: "___चं नाव घेते सूर्य चंद्र साक्षीला, तुमच्याबरोबर जगायचं आहे प्रत्येक क्षणाला!", english: "Taking ___'s name with sun and moon as witness, I want to live every moment with you!" },
    ],
    PHILOSOPHICAL: [
      { marathi: "___चं नाव घेते विचार करता करता, जीवन म्हणजे काय हे कळतं तुमच्या सोबता!", english: "Taking ___'s name while thinking, I understand life's meaning in your company!" },
    ],
    SARCASTIC: [
      { marathi: "___चं नाव घेते नाईलाजानं, लग्न केलं तेव्हाच कळलं काय होतं बेसावधपणानं!", english: "Taking ___'s name reluctantly, I understood what happened only after the careless marriage!" },
    ],
    GENERAL: [
      { marathi: "___चं नाव घेते आनंदानं, पुण्यात राहतो आम्ही अभिमानानं!", english: "Taking ___'s name with joy, we live in Pune with pride!" },
    ],
  },
  MEME: {
    HUMOROUS: [
      { marathi: "पुणेकर GPS: 'सरळ जा, मग उजवीकडे... अरे तिथे नाही, मागे या... सोडा, मी सांगतो ते ऐका!'", english: "Punekar GPS: 'Go straight, then right... no not there, come back... forget it, just listen to me!'" },
      { marathi: "पुणेकर ३ वेळा 'बरोबर' म्हणाला म्हणजे तुम्ही पूर्ण चुकीचे आहात!", english: "If a Punekar says 'correct' 3 times, you're completely wrong!" },
    ],
    ROMANTIC: [
      { marathi: "बायको: 'तुला माझ्याबद्दल काय वाटतं?' पुणेकर: 'वडापाव नंतर तूच!'", english: "Wife: 'What do you think about me?' Punekar: 'After vada pav, you're next!'" },
    ],
    PHILOSOPHICAL: [
      { marathi: "पुणेकर म्हणतात: 'जगात फक्त दोनच गोष्टी certain आहेत - death आणि Pune चा traffic!'", english: "Punekars say: 'Only two things are certain in life - death and Pune's traffic!'" },
    ],
    SARCASTIC: [
      { marathi: "बाहेरचे लोक: 'पुणेकर खूप attitude दाखवतात' पुणेकर: 'ते attitude नाही, ते facts आहेत!'", english: "Outsiders: 'Punekars show too much attitude' Punekars: 'That's not attitude, those are facts!'" },
    ],
    GENERAL: [
      { marathi: "पुणे fact: इथे प्रत्येक दुसऱ्या व्यक्तीकडे opinion आहे, आणि ते तुम्हाला सांगणारच!", english: "Pune fact: Every other person here has an opinion, and they WILL tell you!" },
    ],
  },
}

function getRandomTemplate(type: string, category: string) {
  const typeTemplates = TEMPLATES[type]
  if (!typeTemplates) return null
  const categoryTemplates = typeTemplates[category]
  if (!categoryTemplates || categoryTemplates.length === 0) return null
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required to generate AI content" }, { status: 401 })
  }

  // Check daily limit
  const userRef = db.collection("users").doc(session.user.id)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const user = userDoc.data()!
  const now = new Date()
  const resetTime = user.aiUsageResetAt ? new Date(user.aiUsageResetAt) : null
  let currentUsageCount = user.aiUsageCount || 0

  if (!resetTime || now > resetTime) {
    // Reset usage counter
    await userRef.update({
      aiUsageCount: 0,
      aiUsageResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    })
    currentUsageCount = 0
  } else if (currentUsageCount >= AI_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily AI generation limit (${AI_DAILY_LIMIT}) reached. Try again tomorrow!` },
      { status: 429 }
    )
  }

  try {
    const { type, category, language } = await request.json()

    if (!type || !["PATYA", "UKHANE", "MEME"].includes(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }
    if (!category || !["HUMOROUS", "ROMANTIC", "PHILOSOPHICAL", "SARCASTIC", "GENERAL"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const template = getRandomTemplate(type, category)
    if (!template) {
      return NextResponse.json({ error: "No content available for this combination" }, { status: 404 })
    }

    const lang = language || "BOTH"
    const result = {
      textMarathi: ["MARATHI", "BOTH"].includes(lang) ? template.marathi : null,
      textEnglish: ["ENGLISH", "BOTH"].includes(lang) ? template.english : null,
      type,
      category,
      language: lang,
    }

    // Increment usage
    await userRef.update({
      aiUsageCount: FieldValue.increment(1),
    })

    return NextResponse.json({ generated: result, remainingUsage: AI_DAILY_LIMIT - (currentUsageCount + 1) })
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
