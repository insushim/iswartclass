'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClassOption {
  id: string;
  name: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classId, setClassId] = useState('');
  const [ageGroup, setAgeGroup] = useState('LOWER_ELEM');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('이름을 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nickname: nickname || undefined,
          classId: classId || undefined,
          ageGroup,
          parentEmail: parentEmail || undefined,
          parentPhone: parentPhone || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to create student');

      toast.success('학생이 등록되었습니다');
      router.push('/classroom/students');
    } catch (error) {
      toast.error('학생 등록에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">새 학생 등록</h1>
          <p className="text-muted-foreground">새로운 학생을 등록합니다</p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            학생 정보
          </CardTitle>
          <CardDescription>학생의 기본 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                placeholder="학생 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">별명</Label>
              <Input
                id="nickname"
                placeholder="별명 (선택사항)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">학급</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="학급 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">연령대</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="연령대 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODDLER">유아 (5-6세)</SelectItem>
                  <SelectItem value="LOWER_ELEM">초등 저학년 (1-3학년)</SelectItem>
                  <SelectItem value="UPPER_ELEM">초등 고학년 (4-6학년)</SelectItem>
                  <SelectItem value="ALL">전체</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">학부모 이메일</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">학부모 전화번호</Label>
              <Input
                id="parentPhone"
                type="tel"
                placeholder="010-0000-0000"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                placeholder="학생에 대한 메모 (선택사항)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 등록 중...</>
                ) : (
                  '학생 등록'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
