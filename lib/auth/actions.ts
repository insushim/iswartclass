'use server';

import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

const registerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
    ),
});

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export async function registerUser(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: { email: ['이미 가입된 이메일입니다'] },
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Initialize subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'FREE',
      status: 'ACTIVE',
      credits: 30,
      monthlyCredits: 30,
    },
  });

  return { success: true };
}

export async function loginUser(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: '입력 정보를 확인해주세요',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' };
        default:
          return { success: false, error: '로그인 중 오류가 발생했습니다' };
      }
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}

export async function logoutUser() {
  await signOut({ redirectTo: '/login' });
}
