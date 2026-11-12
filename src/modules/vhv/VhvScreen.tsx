import React, { useMemo, useState } from 'react';
import type { Patient } from '../../types';
import { calculateBMI, calculateMalaRiskScore, getMalaRiskLevel } from '../../utils/riskEngine';
import { assessMetforminDose, parseMetforminDoseMg } from '../../utils/metforminGuideline';
import { getPatientScreeningArea } from '../../utils/patientData';
import { MapPin, ArrowLeft, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';

import { WizardProgress } from './components/WizardProgress';
import { Step1ScanHN } from './steps/Step1ScanHN';
import { Step2Weight } from './steps/Step2Weight';
import { Step3Height } from './steps/Step3Height';
import { Step4RiskFactors, type AlcoholLevel } from './steps/Step4RiskFactors';
import { Step5Review } from './steps/Step5Review';
import { Step6Result } from './steps/Step6Result';

interface VhvScreenProps {
  patients: Patient[];
  onUpdatePatient: (updated: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onImportPatients: (patients: Patient[]) => Promise<{ added: number; updated: number }>;
  onLogout: () => void;
}

type Step = 'hn' | 'dose-stop' | 'weight' | 'height' | 'risk' | 'review' | 'result';

const STEP_ORDER: Step[] = ['hn', 'weight', 'height', 'risk', 'review', 'result'];
const STEP_LABELS: Record<Step, string> = {
  hn: 'สแกน HN',
  'dose-stop': 'ส่งต่อแพทย์',
  weight: 'น้ำหนัก',
  height: 'ส่วนสูง',
  risk: 'ปัจจัยเสี่ยง',
  review: 'ตรวจทานข้อมูล',
  result: 'ผลประเมิน',
};

export const VhvScreen: React.FC<VhvScreenProps> = ({ patients, onUpdatePatient, onAddPatient, onImportPatients, onLogout }) => {
  const [step, setStep] = useState<Step>('hn');

  const pendingPatients = useMemo(() => patients.filter((p) => p.status !== 'Resolved'), [patients]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(pendingPatients[0]?.id || patients[0]?.id || '');

  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [alcoholLevel, setAlcoholLevel] = useState<AlcoholLevel>('none');
  const [bingeDrinking, setBingeDrinking] = useState(false);
  const [highWeeklyAlcohol, setHighWeeklyAlcohol] = useState(false);
  const [hasDehydration, setHasDehydration] = useState(false);
  const [poorIntake, setPoorIntake] = useState(false);
  const [painMedication, setPainMedication] = useState(false);
  const [supplementOrHerbal, setSupplementOrHerbal] = useState(false);
  const [submittedRisk, setSubmittedRisk] = useState<{ risk: string; cpg: string; score: number } | null>(null);
  const [doseReviewMessage, setDoseReviewMessage] = useState<string | null>(null);
  const [activeScreeningId, setActiveScreeningId] = useState<string | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const weight = Number(weightInput) || 0;
  const height = Number(heightInput) || (currentPatient ? currentPatient.height * 100 : 0);
  const bmi = weight && height ? calculateBMI(weight, height / 100) : 0;

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoBack = step !== 'hn' && step !== 'result' && step !== 'dose-stop';

  const goTo = (s: Step) => setStep(s);
  const goBack = () => {
    if (stepIndex > 0) goTo(STEP_ORDER[stepIndex - 1]);
  };

  const handleConfirmHN = (patientOverride?: Patient) => {
    const patientToScreen = patientOverride || currentPatient;
    if (!patientToScreen) return;
    const doseAssessment = assessMetforminDose(patientToScreen.egfr, parseMetforminDoseMg(patientToScreen.metforminDose));
    const screeningId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const screeningRecord = {
      id: screeningId,
      screenedAt: new Date().toISOString(),
      screeningArea: getPatientScreeningArea(patientToScreen),
      dosePassed: doseAssessment.status === 'within-range',
      egfr: patientToScreen.egfr,
      metforminDose: patientToScreen.metforminDose,
    };
    setActiveScreeningId(screeningId);
    if (doseAssessment.status !== 'within-range') {
      const updatedPatient: Patient = {
        ...patientToScreen,
        screeningHistory: [...(patientToScreen.screeningHistory || []), screeningRecord],
        status: 'Escalated',
        caseType: 'DOSE_REVIEW',
        nurseNote: `${doseAssessment.title}: ${doseAssessment.detail} หยุดการประเมิน MALA และส่งแพทย์พิจารณาเร่งด่วน`,
        updatedAt: new Date().toLocaleString('th-TH'),
      };
      onUpdatePatient(updatedPatient);
      setDoseReviewMessage(doseAssessment.detail);
      goTo('dose-stop');
      return;
    }
    onUpdatePatient({
      ...patientToScreen,
      screeningHistory: [...(patientToScreen.screeningHistory || []), screeningRecord],
    });
    if (patientToScreen.height) {
      setHeightInput(String(Math.round(patientToScreen.height * 100)));
    }
    goTo('weight');
  };

  const handleFinalSubmit = () => {
    if (!currentPatient) return;
    const riskyAlcohol = alcoholLevel === 'drinking' && (bingeDrinking || highWeeklyAlcohol);
    const score = calculateMalaRiskScore(currentPatient.egfr, bmi, riskyAlcohol);
    const risk = getMalaRiskLevel(score);
    const cpg = score >= 2
      ? 'คะแนนตั้งแต่ 2 ขึ้นไป: เฝ้าระวังใกล้ชิด ทบทวนขนาดยาหรือการหยุด Metformin โดยแพทย์ และให้คำแนะนำงดเหล้า/กฎวันป่วยตามปัจจัยที่พบ'
      : 'คะแนนต่ำกว่า 2: ให้คำแนะนำตาม CPG และติดตามตามปกติ';

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedPatient: Patient = {
      ...currentPatient,
      weight,
      bmi,
      hasDehydration,
      hasAlcohol: alcoholLevel !== 'none',
      bingeDrinking: alcoholLevel === 'drinking' && bingeDrinking,
      highWeeklyAlcohol: alcoholLevel === 'drinking' && highWeeklyAlcohol,
      poorIntake,
      painMedication,
      supplementOrHerbal,
      riskScore: score,
      riskLevel: risk,
      screeningHistory: (currentPatient.screeningHistory || []).map((record) => record.id === activeScreeningId
        ? { ...record, riskScore: score, riskLevel: risk, bmi, hasDehydration, bingeDrinking, highWeeklyAlcohol, poorIntake, painMedication, supplementOrHerbal }
        : record),
      caseType: score >= 2 ? 'MALA_RISK' : 'ROUTINE',
      careManagerStatus: score >= 2 ? 'Pending' : undefined,
      cpgGuideline: cpg,
      screenedBy: 'เจ้าหน้าที่ รพ.สต. ท่าสาย',
      // ผล Part 2 เข้า queue ผู้ดูแลเคสเมื่อคะแนนเข้าเกณฑ์เสี่ยง ไม่เข้าคิวแพทย์
      status: 'Screened',
      updatedAt: formattedDate,
    };

    onUpdatePatient(updatedPatient);
    setSubmittedRisk({ risk, cpg, score });
    goTo('result');
  };
  const resetWizard = () => {
    setStep('hn');
    setWeightInput('');
    setHeightInput('');
    setAlcoholLevel('none');
    setBingeDrinking(false);
    setHighWeeklyAlcohol(false);
    setHasDehydration(false);
    setPoorIntake(false);
    setPainMedication(false);
    setSupplementOrHerbal(false);
    setSubmittedRisk(null);
    setDoseReviewMessage(null);
  };

  const nextDisabled = (step === 'weight' && !weightInput) || (step === 'height' && !heightInput);

  return (
    <div className="min-h-[calc(100vh-60px)] text-[#17301F]" style={{ background: '#F6F4EF' }}>
      {/* แถบหัวเรื่องสีเขียว (Header) */}
      <div className="bg-[#0E5C33] text-white">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white border border-white/25 flex items-center justify-center flex-shrink-0 overflow-hidden">
  <img
    src={logo}
    alt="โลโก้ รพ.สต."
    className="w-full h-full object-contain p-1"
  />
</div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold leading-tight truncate">คัดกรองความเสี่ยง Metformin ณ จุดจ่ายยา</h1>
              <div className="flex items-center gap-1.5 text-[11.5px] text-white/75 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>รพ.สต. ท่าสาย (เครือข่าย รพ.เชียงรายประชานุเคราะห์)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-6">
        {step !== 'result' && step !== 'dose-stop' && (
          <WizardProgress
            currentStepIndex={stepIndex}
            currentLabel={STEP_LABELS[step]}
            stepLabels={STEP_ORDER.slice(0, 5).map((s) => STEP_LABELS[s])}
          />
        )}

        <div className="bg-white rounded-lg border border-[#E1E4DB] p-5 shadow-sm">
          {step === 'dose-stop' && currentPatient && (
            <section className="space-y-5" role="alert">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950">
                <h2 className="text-lg font-semibold">ขนาดยาเกินเกณฑ์ · ส่งแพทย์ทันที</h2>
                <p className="mt-2 text-sm leading-relaxed">{doseReviewMessage}</p>
                <p className="mt-3 text-sm font-medium">หยุดการประเมินความเสี่ยง MALA ไว้ก่อน เคสถูกเพิ่มเข้าคิวแพทย์เพื่อพิจารณาเร่งด่วน</p>
                <p className="mt-2 text-xs text-red-800">ให้ปฏิบัติตามคำสั่งแพทย์เรื่องการหยุดหรือปรับยา ระบบบันทึกและส่งต่อเคสเท่านั้น</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="font-semibold">{currentPatient.name}</p>
                <p className="mt-1 text-sm text-zinc-500">HN {currentPatient.citizenId} · ยาปัจจุบัน {currentPatient.metforminDose} · eGFR {currentPatient.egfr}</p>
                <p className="mt-3 text-sm font-medium text-red-700">บันทึกเข้าคิวแพทย์แล้ว</p>
              </div>
              <button type="button" onClick={resetWizard} className="w-full rounded-xl bg-[#0E5C33] py-3.5 font-medium text-white hover:bg-[#0A431F]">เสร็จสิ้น · สแกนผู้ป่วยรายถัดไป</button>
            </section>
          )}

          {step === 'hn' && (
            <Step1ScanHN
              patients={patients}
              currentPatient={currentPatient}
              onAddPatient={onAddPatient}
              onUpdatePatient={onUpdatePatient}
              onImportPatients={onImportPatients}
              onSelectPatient={setSelectedPatientId}
              onConfirm={handleConfirmHN}
            />
          )}

          {step === 'weight' && currentPatient && (
            <Step2Weight
              currentPatient={currentPatient}
              weightInput={weightInput}
              onWeightChange={setWeightInput}
            />
          )}

          {step === 'height' && (
            <Step3Height
              heightInput={heightInput}
              bmi={bmi}
              onHeightChange={setHeightInput}
            />
          )}

          {step === 'risk' && (
            <Step4RiskFactors
              alcoholLevel={alcoholLevel}
              bingeDrinking={bingeDrinking}
              highWeeklyAlcohol={highWeeklyAlcohol}
              hasDehydration={hasDehydration}
              poorIntake={poorIntake}
              painMedication={painMedication}
              supplementOrHerbal={supplementOrHerbal}
              onSelectAlcohol={setAlcoholLevel}
              onToggleBingeDrinking={setBingeDrinking}
              onToggleHighWeeklyAlcohol={setHighWeeklyAlcohol}
              onToggleDehydration={setHasDehydration}
              onTogglePoorIntake={setPoorIntake}
              onTogglePainMedication={setPainMedication}
              onToggleSupplementOrHerbal={setSupplementOrHerbal}
              isFemale={currentPatient?.gender === 'หญิง' || currentPatient?.gender === 'Female'}
            />
          )}

          {step === 'review' && currentPatient && (
            <Step5Review
              patient={currentPatient}
              weight={weight}
              height={height}
              bmi={bmi}
              alcoholLevel={alcoholLevel}
              hasDehydration={hasDehydration}
              bingeDrinking={bingeDrinking}
              highWeeklyAlcohol={highWeeklyAlcohol}
              poorIntake={poorIntake}
              painMedication={painMedication}
              supplementOrHerbal={supplementOrHerbal}
            />
          )}

          {step === 'result' && submittedRisk && currentPatient && (
    <Step6Result
      patient={currentPatient}
      risk={submittedRisk.risk}
      cpg={submittedRisk.cpg}
              riskScore={submittedRisk.score}
      onReset={resetWizard}
    />
  )}
        </div>

        {/* ปุ่ม Back & Next */}
        {step !== 'result' && step !== 'dose-stop' && step !== 'hn' && (
          <div className="flex gap-2.5 mt-4">
            {canGoBack && (
              <button
                type="button"
                onClick={goBack}
                className="h-12 px-4 rounded-md border border-[#DCE3DA] bg-white text-[#5C6B5F] font-semibold text-[13.5px] flex items-center gap-1.5 hover:bg-[#F6F4EF] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                ย้อนกลับ
              </button>
            )}
            {step === 'review' ? (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 h-12 rounded-md bg-[#0E5C33] hover:bg-[#0A431F] text-white font-semibold text-[13.5px] transition shadow"
              >
                บันทึกและประเมินความเสี่ยง
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(STEP_ORDER[stepIndex + 1])}
                disabled={nextDisabled}
                className="flex-1 h-12 rounded-md bg-[#0E5C33] hover:bg-[#0A431F] text-white font-semibold text-[13.5px] transition disabled:opacity-40 shadow"
              >
                ถัดไป · {STEP_LABELS[STEP_ORDER[stepIndex + 1]]}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
