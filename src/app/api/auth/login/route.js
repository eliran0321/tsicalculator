import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/firebase'; // ../../../../ → ל src/lib
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'חסר שם משתמש/סיסמה' }, { status: 400 });
    }

    const snap = await getDoc(doc(db, 'users', username));
    if (!snap.exists()) {
      return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 401 });
    }
    const user = snap.data();

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 });
    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'החשבון ממתין לאישור' }, { status: 403 });
    }

    const token = jwt.sign(
      { username, role: 'user', email: user.email ?? '' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({
      success: true,
      user: { username, name: user.name ?? '', email: user.email ?? '' },
    });

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
