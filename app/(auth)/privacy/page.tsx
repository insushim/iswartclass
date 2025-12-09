export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">개인정보처리방침</h1>
      <div className="prose prose-sm">
        <h2>1. 수집하는 개인정보</h2>
        <p>이메일, 이름, 비밀번호(암호화 저장)</p>

        <h2>2. 개인정보의 이용 목적</h2>
        <p>서비스 제공, 회원 관리, 서비스 개선</p>

        <h2>3. 개인정보의 보유 기간</h2>
        <p>회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.</p>

        <h2>4. 개인정보의 제3자 제공</h2>
        <p>법령에 의한 경우를 제외하고 제3자에게 제공하지 않습니다.</p>

        <h2>5. 문의</h2>
        <p>개인정보 관련 문의는 서비스 내 문의하기를 이용해주세요.</p>
      </div>
    </div>
  );
}
