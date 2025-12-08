export const THEMES = {
  ANIMALS: {
    id: 'ANIMALS',
    name: 'Animals',
    nameKo: '동물',
    icon: 'Cat',
    color: '#F59E0B',
    subThemes: [
      { id: 'pets', name: '반려동물', examples: ['강아지', '고양이', '햄스터', '토끼', '금붕어'] },
      { id: 'forest', name: '숲속 동물', examples: ['여우', '사슴', '다람쥐', '곰', '부엉이'] },
      { id: 'ocean', name: '바다 생물', examples: ['돌고래', '상어', '문어', '거북이', '해마'] },
      { id: 'farm', name: '농장 동물', examples: ['소', '돼지', '닭', '양', '말'] },
      { id: 'dinosaur', name: '공룡', examples: ['티라노', '트리케라톱스', '브라키오', '스테고', '프테라노돈'] },
      { id: 'insects', name: '곤충', examples: ['나비', '무당벌레', '벌', '잠자리', '개미'] },
      { id: 'birds', name: '새', examples: ['참새', '독수리', '펭귄', '앵무새', '플라밍고'] },
      { id: 'tropical', name: '열대 동물', examples: ['사자', '코끼리', '기린', '얼룩말', '원숭이'] },
      { id: 'arctic', name: '북극 동물', examples: ['북극곰', '펭귄', '물개', '순록', '북극여우'] },
      { id: 'reptiles', name: '파충류', examples: ['도마뱀', '뱀', '악어', '이구아나', '카멜레온'] },
      { id: 'underwater', name: '심해 생물', examples: ['해파리', '랍스터', '불가사리', '조개', '산호'] },
      { id: 'baby', name: '아기 동물', examples: ['강아지', '고양이', '병아리', '아기곰', '아기토끼'] }
    ]
  },
  PLANTS: {
    id: 'PLANTS',
    name: 'Plants',
    nameKo: '식물',
    icon: 'Flower2',
    color: '#10B981',
    subThemes: [
      { id: 'flowers', name: '꽃', examples: ['장미', '해바라기', '튤립', '벚꽃', '민들레'] },
      { id: 'trees', name: '나무', examples: ['소나무', '단풍나무', '참나무', '야자수', '버드나무'] },
      { id: 'fruits', name: '과일', examples: ['사과', '딸기', '포도', '수박', '오렌지'] },
      { id: 'vegetables', name: '채소', examples: ['당근', '브로콜리', '토마토', '호박', '옥수수'] },
      { id: 'cactus', name: '다육/선인장', examples: ['선인장', '다육이', '알로에', '용설란'] },
      { id: 'garden', name: '정원', examples: ['화분', '정원', '온실', '텃밭', '잔디'] }
    ]
  },
  NATURE: {
    id: 'NATURE',
    name: 'Nature',
    nameKo: '자연',
    icon: 'TreeDeciduous',
    color: '#059669',
    subThemes: [
      { id: 'sky', name: '하늘', examples: ['구름', '무지개', '태양', '달', '별'] },
      { id: 'weather', name: '날씨', examples: ['비', '눈', '번개', '바람', '안개'] },
      { id: 'landscape', name: '풍경', examples: ['산', '호수', '폭포', '계곡', '들판'] },
      { id: 'ocean', name: '바다', examples: ['해변', '파도', '등대', '섬', '절벽'] },
      { id: 'forest', name: '숲', examples: ['숲속', '나무', '버섯', '이끼', '시냇물'] },
      { id: 'space', name: '우주', examples: ['행성', '로켓', '별자리', '은하', '우주선'] }
    ]
  },
  VEHICLES: {
    id: 'VEHICLES',
    name: 'Vehicles',
    nameKo: '탈것',
    icon: 'Car',
    color: '#3B82F6',
    subThemes: [
      { id: 'cars', name: '자동차', examples: ['승용차', '스포츠카', '지프', '택시', '경찰차'] },
      { id: 'planes', name: '비행기', examples: ['여객기', '전투기', '헬리콥터', '열기구', '글라이더'] },
      { id: 'ships', name: '배', examples: ['요트', '크루즈', '잠수함', '어선', '카누'] },
      { id: 'trains', name: '기차', examples: ['기차', 'KTX', '지하철', '트램', '증기기관차'] },
      { id: 'bikes', name: '자전거', examples: ['자전거', '오토바이', '스쿠터', '킥보드', '세발자전거'] },
      { id: 'rockets', name: '로켓', examples: ['로켓', '우주왕복선', 'UFO', '위성', '우주정거장'] },
      { id: 'trucks', name: '트럭', examples: ['덤프트럭', '소방차', '구급차', '버스', '트레일러'] },
      { id: 'construction', name: '공사 차량', examples: ['포크레인', '크레인', '불도저', '믹서트럭', '롤러'] }
    ]
  },
  FOOD: {
    id: 'FOOD',
    name: 'Food',
    nameKo: '음식',
    icon: 'Apple',
    color: '#EF4444',
    subThemes: [
      { id: 'fruits', name: '과일', examples: ['사과', '바나나', '포도', '딸기', '수박'] },
      { id: 'vegetables', name: '채소', examples: ['당근', '브로콜리', '토마토', '감자', '양파'] },
      { id: 'desserts', name: '디저트', examples: ['케이크', '아이스크림', '도넛', '마카롱', '와플'] },
      { id: 'korean', name: '한식', examples: ['비빔밥', '김치', '떡볶이', '김밥', '삼겹살'] },
      { id: 'bread', name: '빵', examples: ['식빵', '바게트', '크로아상', '베이글', '머핀'] },
      { id: 'drinks', name: '음료', examples: ['주스', '우유', '커피', '차', '스무디'] },
      { id: 'snacks', name: '간식', examples: ['쿠키', '사탕', '초콜릿', '팝콘', '젤리'] },
      { id: 'icecream', name: '아이스크림', examples: ['콘', '바', '선데이', '빙수', '젤라또'] },
      { id: 'lunchbox', name: '도시락', examples: ['캐릭터 도시락', '김밥 도시락', '샌드위치 도시락'] },
      { id: 'fast_food', name: '패스트푸드', examples: ['햄버거', '피자', '핫도그', '치킨', '감자튀김'] }
    ]
  },
  FANTASY: {
    id: 'FANTASY',
    name: 'Fantasy',
    nameKo: '판타지',
    icon: 'Wand2',
    color: '#8B5CF6',
    subThemes: [
      { id: 'princess', name: '공주/왕자', examples: ['공주', '왕자', '성', '왕관', '요정'] },
      { id: 'dragons', name: '용', examples: ['용', '드래곤', '비늘', '날개', '불꽃'] },
      { id: 'unicorns', name: '유니콘', examples: ['유니콘', '페가수스', '뿔', '무지개 갈기'] },
      { id: 'wizards', name: '마법사', examples: ['마법사', '마녀', '지팡이', '마법책', '물약'] },
      { id: 'fairies', name: '요정', examples: ['요정', '픽시', '날개', '별가루', '꽃요정'] },
      { id: 'robots', name: '로봇', examples: ['로봇', '메카', '사이보그', 'AI', '안드로이드'] },
      { id: 'monsters', name: '괴물', examples: ['괴물', '몬스터', '고스트', '좀비', '드라큘라'] },
      { id: 'superheroes', name: '슈퍼히어로', examples: ['히어로', '빌런', '망토', '마스크', '파워'] },
      { id: 'castle', name: '마법의 성', examples: ['마법성', '탑', '해자', '왕좌', '보물상자'] },
      { id: 'aliens', name: '외계인', examples: ['외계인', 'UFO', '외계 행성', '우주 생명체'] },
      { id: 'mermaids', name: '인어', examples: ['인어', '인어공주', '바다왕국', '조개', '해초'] },
      { id: 'mythology', name: '신화', examples: ['그리스 신화', '북유럽 신화', '동양 신화', '전설'] }
    ]
  },
  DAILY_LIFE: {
    id: 'DAILY_LIFE',
    name: 'Daily Life',
    nameKo: '일상생활',
    icon: 'Home',
    color: '#F97316',
    subThemes: [
      { id: 'family', name: '가족', examples: ['엄마', '아빠', '형제', '조부모', '가족사진'] },
      { id: 'school', name: '학교', examples: ['교실', '운동장', '급식', '선생님', '친구'] },
      { id: 'playground', name: '놀이터', examples: ['그네', '미끄럼틀', '시소', '정글짐', '모래놀이'] },
      { id: 'home', name: '집', examples: ['거실', '침실', '주방', '욕실', '정원'] },
      { id: 'jobs', name: '직업', examples: ['의사', '소방관', '경찰', '요리사', '선생님'] },
      { id: 'hobbies', name: '취미', examples: ['그림', '음악', '요리', '정원가꾸기', '독서'] },
      { id: 'sports', name: '스포츠', examples: ['축구', '야구', '수영', '달리기', '체조'] },
      { id: 'instruments', name: '악기', examples: ['피아노', '기타', '바이올린', '드럼', '플루트'] },
      { id: 'clothes', name: '옷', examples: ['티셔츠', '바지', '원피스', '모자', '신발'] },
      { id: 'toys', name: '장난감', examples: ['인형', '레고', '퍼즐', '공', '자동차'] },
      { id: 'emotions', name: '감정', examples: ['기쁨', '슬픔', '화남', '놀람', '사랑'] },
      { id: 'body', name: '신체', examples: ['얼굴', '손', '발', '몸', '표정'] }
    ]
  },
  CULTURE: {
    id: 'CULTURE',
    name: 'Culture',
    nameKo: '문화/전통',
    icon: 'Landmark',
    color: '#DC2626',
    subThemes: [
      { id: 'korean', name: '한국 전통', examples: ['한복', '전통가옥', '탈', '부채', '전통문양'] },
      { id: 'world', name: '세계 문화', examples: ['에펠탑', '피사의 탑', '자유의 여신상', '피라미드'] },
      { id: 'festivals', name: '축제', examples: ['불꽃놀이', '퍼레이드', '카니발', '등축제'] },
      { id: 'holidays', name: '명절', examples: ['설날', '추석', '단오', '정월대보름'] },
      { id: 'costumes', name: '전통 의상', examples: ['한복', '기모노', '치파오', '사리'] },
      { id: 'landmarks', name: '랜드마크', examples: ['경복궁', '첨성대', '석굴암', '남대문'] },
      { id: 'history', name: '역사', examples: ['선사시대', '고조선', '삼국시대', '조선시대'] },
      { id: 'folk', name: '민속', examples: ['탈춤', '씨름', '널뛰기', '연날리기', '팽이치기'] }
    ]
  },
  PATTERNS: {
    id: 'PATTERNS',
    name: 'Patterns',
    nameKo: '패턴/도형',
    icon: 'Shapes',
    color: '#6366F1',
    subThemes: [
      { id: 'geometric', name: '기하학 패턴', examples: ['삼각형', '원', '사각형', '육각형'] },
      { id: 'mandala', name: '만다라', examples: ['꽃 만다라', '기하학 만다라', '동물 만다라'] },
      { id: 'tile', name: '타일 패턴', examples: ['모로코 타일', '기하학 타일', '꽃 타일'] },
      { id: 'natural', name: '자연 패턴', examples: ['나뭇잎', '눈결정', '파도', '조개'] },
      { id: 'stripes', name: '줄무늬', examples: ['직선', '곡선', '지그재그', '셰브론'] },
      { id: 'waves', name: '물결', examples: ['물결', '소용돌이', '물방울', '리플'] },
      { id: 'circles', name: '동심원', examples: ['동심원', '나선', '원 패턴', '점'] },
      { id: 'checkered', name: '체크', examples: ['체스판', '깅엄', '타탄', '아가일'] },
      { id: 'dots', name: '도트', examples: ['폴카도트', '점점이', '스플래터'] },
      { id: 'mosaic', name: '모자이크', examples: ['색 모자이크', '숫자 모자이크', '그림 모자이크'] }
    ]
  },
  SEASONS: {
    id: 'SEASONS',
    name: 'Seasons',
    nameKo: '계절/행사',
    icon: 'Calendar',
    color: '#EC4899',
    isSeasonal: true,
    subThemes: [
      { id: 'spring', name: '봄', examples: ['벚꽃', '나비', '새싹', '봄꽃', '소풍'] },
      { id: 'summer', name: '여름', examples: ['해변', '수박', '선풍기', '수영', '빙수'] },
      { id: 'fall', name: '가을', examples: ['단풍', '낙엽', '허수아비', '추수', '도토리'] },
      { id: 'winter', name: '겨울', examples: ['눈사람', '눈송이', '스키', '핫초코', '벽난로'] },
      { id: 'birthday', name: '생일', examples: ['케이크', '풍선', '선물', '파티모자', '촛불'] },
      { id: 'christmas', name: '크리스마스', examples: ['산타', '루돌프', '트리', '선물', '눈'] },
      { id: 'halloween', name: '핼러윈', examples: ['호박', '마녀', '유령', '박쥐', '거미'] },
      { id: 'newyear', name: '새해', examples: ['폭죽', '달력', '해돋이', '소원', '덕담'] },
      { id: 'chuseok', name: '추석', examples: ['보름달', '송편', '한복', '강강술래', '윷놀이'] },
      { id: 'childrensday', name: '어린이날', examples: ['풍선', '놀이공원', '선물', '행복', '꿈'] },
      { id: 'easter', name: '부활절', examples: ['달걀', '토끼', '병아리', '꽃', '바구니'] },
      { id: 'valentines', name: '발렌타인', examples: ['하트', '초콜릿', '편지', '꽃', '사랑'] }
    ]
  },
  EDUCATION: {
    id: 'EDUCATION',
    name: 'Education',
    nameKo: '교육/학습',
    icon: 'BookOpen',
    color: '#14B8A6',
    subThemes: [
      { id: 'numbers', name: '숫자', examples: ['1-10', '11-20', '덧셈', '뺄셈', '구구단'] },
      { id: 'alphabet', name: '알파벳', examples: ['ABC', '대문자', '소문자', '단어'] },
      { id: 'hangul', name: '한글', examples: ['ㄱㄴㄷ', '가나다', '자음', '모음', '단어'] },
      { id: 'science', name: '과학', examples: ['실험', '원소', '인체', '자석', '전기'] },
      { id: 'map', name: '지도', examples: ['세계지도', '한국지도', '대륙', '나라'] },
      { id: 'clock', name: '시계', examples: ['시간', '분', '초', '일과', '시간표'] },
      { id: 'measurement', name: '측정', examples: ['길이', '무게', '넓이', '부피', '온도'] },
      { id: 'sorting', name: '분류', examples: ['색깔', '모양', '크기', '종류'] },
      { id: 'comparison', name: '비교', examples: ['크다/작다', '많다/적다', '길다/짧다'] },
      { id: 'logic', name: '논리', examples: ['순서', '패턴', '미로', '퍼즐', '추론'] }
    ]
  },
  CHARACTERS: {
    id: 'CHARACTERS',
    name: 'Characters',
    nameKo: '캐릭터',
    icon: 'Smile',
    color: '#F472B6',
    subThemes: [
      { id: 'cute', name: '귀여운 캐릭터', examples: ['둥근 캐릭터', '동물 캐릭터', '음식 캐릭터'] },
      { id: 'emoji', name: '이모지', examples: ['웃는 얼굴', '동물 이모지', '음식 이모지'] },
      { id: 'mascot', name: '마스코트', examples: ['동물 마스코트', '과일 마스코트'] },
      { id: 'chibi', name: '치비', examples: ['치비 사람', '치비 동물', '치비 직업'] },
      { id: 'kawaii', name: '카와이', examples: ['카와이 동물', '카와이 음식', '카와이 물건'] }
    ]
  },
  PLACES: {
    id: 'PLACES',
    name: 'Places',
    nameKo: '장소',
    icon: 'MapPin',
    color: '#0EA5E9',
    subThemes: [
      { id: 'city', name: '도시', examples: ['빌딩', '거리', '공원', '다리', '지하철'] },
      { id: 'countryside', name: '시골', examples: ['농장', '논밭', '헛간', '풍차', '우물'] },
      { id: 'amusement', name: '놀이공원', examples: ['롤러코스터', '회전목마', '관람차', '범퍼카'] },
      { id: 'zoo', name: '동물원', examples: ['우리', '사육사', '먹이주기', '지도', '동물'] },
      { id: 'museum', name: '박물관', examples: ['전시품', '공룡', '그림', '조각', '유물'] },
      { id: 'hospital', name: '병원', examples: ['의사', '간호사', '병실', '구급차', '약'] },
      { id: 'library', name: '도서관', examples: ['책장', '책', '독서', '조용히', '대출'] },
      { id: 'restaurant', name: '식당', examples: ['메뉴', '요리사', '테이블', '음식', '웨이터'] }
    ]
  }
} as const;

export type ThemeId = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeId];

// 테마 관련 헬퍼 함수
export function getThemeById(id: string): Theme | undefined {
  return THEMES[id as ThemeId];
}

export function getSubThemesByTheme(themeId: string) {
  const theme = THEMES[themeId as ThemeId];
  return theme?.subThemes || [];
}

export function getRandomSubTheme(themeId: string) {
  const subThemes = getSubThemesByTheme(themeId);
  return subThemes[Math.floor(Math.random() * subThemes.length)];
}

export function getSeasonalThemes() {
  return Object.values(THEMES).filter(theme => 'isSeasonal' in theme && theme.isSeasonal);
}

export function getAllThemesList() {
  return Object.values(THEMES);
}
