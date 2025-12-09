'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Image,
  User,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function NewPortfolioPage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mock students
  const students = [
    { id: '1', name: '김민준', class: '1-A반' },
    { id: '2', name: '이서연', class: '1-A반' },
    { id: '3', name: '박지호', class: '1-B반' },
    { id: '4', name: '최수아', class: '1-B반' },
    { id: '5', name: '정우진', class: '2-A반' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !title) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('포트폴리오가 생성되었습니다');
    router.push('/portfolio');
    setIsLoading(false);
  };

  const selectedStudent = students.find(s => s.id === studentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">새 포트폴리오 만들기</h1>
          <p className="text-muted-foreground">
            학생의 작품을 모아 포트폴리오를 만들어보세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              학생 선택
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">학생 *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="학생을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{selectedStudent.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.class}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              포트폴리오 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">포트폴리오 제목 *</Label>
              <Input
                id="title"
                placeholder="예: 민준이의 미술 작품집"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="포트폴리오에 대한 설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="public" className="text-base">공개 설정</Label>
                <p className="text-sm text-muted-foreground">
                  공개 포트폴리오는 링크를 가진 모든 사람이 볼 수 있습니다
                </p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>생성 중...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                포트폴리오 생성
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
