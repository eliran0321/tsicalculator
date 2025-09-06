import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { name, email, phone, username, password } = await request.json();
    
    // ולידציה בסיסית
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: 'כל השדות הנדרשים חובה' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      );
    }
    
    // בדוק אם המשתמש קיים
    const userDoc = await getDoc(doc(db, 'users', username));
    
    if (userDoc.exists()) {
      return NextResponse.json(
        { error: 'שם המשתמש כבר קיים' },
        { status: 400 }
      );
    }

    // בדוק אם האימייל קיים (חיפוש בכל המשתמשים)
    // לשיפור: הוסף אינדקס על email ב-Firestore
    
    // הצפן סיסמה
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // צור משתמש חדש
    await setDoc(doc(db, 'users', username), {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      username: username.trim(),
      password: hashedPassword, // סיסמה מוצפנת!
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return NextResponse.json({
      success: true,
      message: 'המשתמש נוצר בהצלחה. ממתין לאישור מנהל.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת משתמש' },
      { status: 500 }
    );
  }
}