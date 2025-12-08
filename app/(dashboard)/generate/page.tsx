'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wand2,
  Sparkles,
  Settings2,
  Download,
  Save,
  Share2,
  Loader2,
  RefreshCw,
  ZoomIn,
  Printer,
  Heart,
  Info,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ART_TECHNIQUES } from '@/lib/constants/artTechniques';
import { THEMES } from '@/lib/constants/themes';
import { AGE_GROUPS } from '@/lib/constants/ageGroups';

const popularTechniques = ['COLORING', 'MANDALA', 'DOT_TO_DOT', 'ORIGAMI', 'MAZE', 'PATTERN'];

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form state
  const [technique, setTechnique] = useState('COLORING');
  const [theme, setTheme] = useState('ANIMALS');
  const [subTheme, setSubTheme] = useState('');
  const [ageGroup, setAgeGroup] = useState('LOWER_ELEMENTARY');
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState([50]);
  const [quantity, setQuantity] = useState([1]);
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);

  const selectedTechnique = ART_TECHNIQUES[technique as keyof typeof ART_TECHNIQUES];
  const selectedTheme = THEMES[theme as keyof typeof THEMES];
  const selectedAgeGroup = AGE_GROUPS[ageGroup as keyof typeof AGE_GROUPS];

  const handleGenerate = async () => {
    if (!technique || !theme || !ageGroup) {
      toast.error('모든 필수 항목을 선택해주세요');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock generated images
      const mockImages = Array(quantity[0])
        .fill(null)
        .map((_, i) => `/api/placeholder/800/800?text=Generated+${i + 1}`);

      setGeneratedImages(mockImages);
      setSelectedImage(mockImages[0]);
      toast.success(`${quantity[0]}개의 도안이 생성되었습니다!`);
    } catch (error) {
      toast.error('도안 생성에 실패했습니다');
      console.error('Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    toast.success('라이브러리에 저장되었습니다');
  };

  const handleDownload = () => {
    toast.success('다운로드를 시작합니다');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI 도안 생성
          </h1>
          <p className="text-muted-foreground">
            AI를 활용하여 맞춤형 미술 도안을 생성하세요
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          남은 크레딧: 10
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                생성 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technique Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  기법 선택
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>36가지 미술 기법 중 선택하세요</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {popularTechniques.map((tech) => {
                    const techData = ART_TECHNIQUES[tech as keyof typeof ART_TECHNIQUES];
                    return (
                      <Button
                        key={tech}
                        variant={technique === tech ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTechnique(tech)}
                        className="gap-1"
                      >
                        <span>{techData?.icon}</span>
                        {techData?.name}
                      </Button>
                    );
                  })}
                </div>
                <Select value={technique} onValueChange={setTechnique}>
                  <SelectTrigger>
                    <SelectValue placeholder="더 많은 기법 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ART_TECHNIQUES).map(([key, tech]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{tech.icon}</span>
                          {tech.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTechnique && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTechnique.description}
                  </p>
                )}
              </div>

              <Separator />

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>테마 선택</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="테마 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(THEMES).map(([key, themeData]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{themeData.icon}</span>
                          {themeData.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTheme?.subThemes && (
                  <Select value={subTheme} onValueChange={setSubTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="세부 테마 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTheme.subThemes.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Age Group */}
              <div className="space-y-3">
                <Label>연령대</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(AGE_GROUPS).map(([key, group]) => (
                    <Button
                      key={key}
                      variant={ageGroup === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAgeGroup(key)}
                      className="flex-col h-auto py-2"
                    >
                      <span className="text-lg">{group.icon}</span>
                      <span className="text-xs">{group.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {group.ageRange}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Prompt */}
              <div className="space-y-3">
                <Label htmlFor="prompt">추가 설명 (선택사항)</Label>
                <Textarea
                  id="prompt"
                  placeholder="예: 귀여운 강아지가 꽃밭에서 놀고 있는 장면"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  더 구체적인 설명을 입력하면 원하는 도안을 얻을 확률이 높아져요
                </p>
              </div>

              {/* Advanced Settings */}
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger className="text-sm">
                    고급 설정
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {/* Complexity */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>복잡도</Label>
                        <span className="text-sm text-muted-foreground">
                          {complexity[0]}%
                        </span>
                      </div>
                      <Slider
                        value={complexity}
                        onValueChange={setComplexity}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>단순</span>
                        <span>복잡</span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>생성 개수</Label>
                        <span className="text-sm text-muted-foreground">
                          {quantity[0]}장
                        </span>
                      </div>
                      <Slider
                        value={quantity}
                        onValueChange={setQuantity}
                        min={1}
                        max={4}
                        step={1}
                      />
                    </div>

                    {/* Paper Size */}
                    <div className="space-y-3">
                      <Label>용지 크기</Label>
                      <Select value={paperSize} onValueChange={setPaperSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (210 x 297mm)</SelectItem>
                          <SelectItem value="A3">A3 (297 x 420mm)</SelectItem>
                          <SelectItem value="B5">B5 (176 x 250mm)</SelectItem>
                          <SelectItem value="Letter">Letter (216 x 279mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Orientation */}
                    <div className="space-y-3">
                      <Label>방향</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={orientation === 'portrait' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('portrait')}
                        >
                          세로
                        </Button>
                        <Button
                          variant={orientation === 'landscape' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('landscape')}
                        >
                          가로
                        </Button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="instructions">활동 안내문 포함</Label>
                        <Switch
                          id="instructions"
                          checked={includeInstructions}
                          onCheckedChange={setIncludeInstructions}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="watermark">워터마크 추가</Label>
                        <Switch
                          id="watermark"
                          checked={includeWatermark}
                          onCheckedChange={setIncludeWatermark}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Generate Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    도안 생성하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="min-h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">미리보기</CardTitle>
                {generatedImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      다시 생성
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">AI가 도안을 생성하고 있어요</p>
                    <p className="text-sm text-muted-foreground">
                      잠시만 기다려주세요...
                    </p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Preview */}
                  <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                    {selectedImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Wand2 className="h-16 w-16 mx-auto mb-4" />
                          <p>생성된 도안 미리보기</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="secondary" size="icon-sm">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon-sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {generatedImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generatedImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`relative h-20 w-20 rounded-lg border-2 overflow-hidden shrink-0 ${
                            selectedImage === img
                              ? 'border-primary'
                              : 'border-transparent'
                          }`}
                        >
                          <div className="absolute inset-0 bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          {selectedImage === img && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline" className="gap-1" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                      저장
                    </Button>
                    <Button variant="outline" className="gap-1" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      다운로드
                    </Button>
                    <Button variant="outline" className="gap-1" onClick={handlePrint}>
                      <Printer className="h-4 w-4" />
                      인쇄
                    </Button>
                    <Button variant="outline" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      공유
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4 text-center">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <Wand2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">도안을 생성해보세요</p>
                    <p className="text-sm text-muted-foreground">
                      왼쪽에서 설정을 선택하고 생성 버튼을 클릭하세요
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technique Info */}
          {selectedTechnique && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{selectedTechnique.icon}</span>
                  {selectedTechnique.name} 기법 안내
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">필요한 재료</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTechnique.materials.map((material) => (
                        <Badge key={material} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">발달 영역</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTechnique.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedTechnique.tips && selectedTechnique.tips.length > 0 && (
                    <div className="sm:col-span-2">
                      <h4 className="text-sm font-medium mb-2">활동 팁</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedTechnique.tips.slice(0, 3).map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
