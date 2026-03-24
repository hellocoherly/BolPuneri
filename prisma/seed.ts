import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import bcrypt from "bcryptjs"

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 10)
  const now = new Date().toISOString()

  // Check if demo user exists
  const existingUsers = await db
    .collection("users")
    .where("email", "==", "demo@bolpuneri.ai")
    .limit(1)
    .get()

  let userId: string
  if (!existingUsers.empty) {
    userId = existingUsers.docs[0].id
    console.log("Demo user already exists:", userId)
  } else {
    const userRef = await db.collection("users").add({
      name: "पुणेकर Demo",
      email: "demo@bolpuneri.ai",
      password: hashedPassword,
      image: null,
      aiUsageCount: 0,
      aiUsageResetAt: null,
      createdAt: now,
      updatedAt: now,
    })
    userId = userRef.id
    console.log("Created demo user:", userId)
  }

  // Seed content
  const seedContent = [
    {
      type: "PATYA",
      category: "HUMOROUS",
      language: "BOTH",
      textMarathi: "आमचं काही चुकलं असेल तर सांगा, पण हळू सांगा... आम्ही पुणेकर आहोत, लगेच सुधारणार नाही!",
      textEnglish: "If we've done something wrong, tell us softly... we're Punekars, we won't improve immediately!",
      isAIGenerated: false,
    },
    {
      type: "PATYA",
      category: "SARCASTIC",
      language: "BOTH",
      textMarathi: "हो हो, तुम्हीच बरोबर! आम्ही पुणेकर उगाच बोलतो!",
      textEnglish: "Yes yes, you're right! We Punekars speak for no reason!",
      isAIGenerated: false,
    },
    {
      type: "UKHANE",
      category: "ROMANTIC",
      language: "BOTH",
      textMarathi: "___चं नाव घेते ओठांवरती, तुमच्यावीण जगणं कठीण या जगती!",
      textEnglish: "Taking ___'s name on my lips, living without you is hard in this world!",
      isAIGenerated: false,
    },
    {
      type: "UKHANE",
      category: "HUMOROUS",
      language: "BOTH",
      textMarathi: "___चं नाव घेते मोठ्या आवाजात, पुणेकर आहोत आम्ही, बोलतो सगळ्यांच्या कानात!",
      textEnglish: "Taking ___'s name loudly, we're Punekars, we speak in everyone's ears!",
      isAIGenerated: false,
    },
    {
      type: "MEME",
      category: "HUMOROUS",
      language: "BOTH",
      textMarathi: "पुणेकर GPS: 'सरळ जा, मग उजवीकडे... अरे तिथे नाही, मागे या... सोडा, मी सांगतो ते ऐका!'",
      textEnglish: "Punekar GPS: 'Go straight, then right... no not there, come back... forget it, just listen to me!'",
      isAIGenerated: true,
    },
    {
      type: "PATYA",
      category: "PHILOSOPHICAL",
      language: "BOTH",
      textMarathi: "जगात दोनच गोष्टी अनंत आहेत: विश्व आणि पुणेकरांचा अहंकार!",
      textEnglish: "Only two things are infinite: the universe and a Punekar's ego!",
      isAIGenerated: false,
    },
    {
      type: "PATYA",
      category: "ROMANTIC",
      language: "BOTH",
      textMarathi: "तुझ्या डोळ्यांत पाहिलं आणि पुण्याचा ट्रॅफिक विसरलो!",
      textEnglish: "I looked into your eyes and forgot Pune's traffic!",
      isAIGenerated: true,
    },
    {
      type: "MEME",
      category: "SARCASTIC",
      language: "BOTH",
      textMarathi: "बाहेरचे लोक: 'पुणेकर खूप attitude दाखवतात' पुणेकर: 'ते attitude नाही, ते facts आहेत!'",
      textEnglish: "Outsiders: 'Punekars show too much attitude' Punekars: 'That's not attitude, those are facts!'",
      isAIGenerated: false,
    },
  ]

  const batch = db.batch()
  for (const item of seedContent) {
    const ref = db.collection("contents").doc()
    batch.set(ref, {
      ...item,
      authorId: userId,
      imageUrl: null,
      likesCount: 0,
      dislikesCount: 0,
      sharesCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  }
  await batch.commit()

  console.log("Seed completed: 1 user, 8 content items")
}

main().catch(console.error)
