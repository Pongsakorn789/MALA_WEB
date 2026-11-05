import React, { useMemo, useState } from 'react';
import type { Patient } from '../../types';
import { calculateBMI, calculateMalaRiskScore, getMalaRiskLevel } from '../../utils/riskEngine';
import { assessMetforminDose, parseMetforminDoseMg } from '../../utils/metforminGuideline';
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
  onLogout: () => void;
}

type Step = 'hn' | 'weight' | 'height' | 'risk' | 'review' | 'result';

const STEP_ORDER: Step[] = ['hn', 'weight', 'height', 'risk', 'review', 'result'];
const STEP_LABELS: Record<Step, string> = {
  hn: 'สแกน HN',
  weight: 'น้ำหนัก',
  height: 'ส่วนสูง',
  risk: 'ปัจจัยเสี่ยง',
  review: 'ตรวจทานข้อมูล',
  result: 'ผลประเมิน',
};

export const VhvScreen: React.FC<VhvScreenProps> = ({ patients, onUpdatePatient, onLogout }) => {
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

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const weight = Number(weightInput) || 0;
  const height = Number(heightInput) || (currentPatient ? currentPatient.height * 100 : 0);
  const bmi = weight && height ? calculateBMI(weight, height / 100) : 0;

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoBack = step !== 'hn' && step !== 'result';

  const goTo = (s: Step) => setStep(s);
  const goBack = () => {
    if (stepIndex > 0) goTo(STEP_ORDER[stepIndex - 1]);
  };

  const handleConfirmHN = () => {
    if (currentPatient?.height) {
      setHeightInput(String(Math.round(currentPatient.height * 100)));
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
      cpgGuideline: cpg,
      screenedBy: 'เจ้าหน้าที่ รพ.สต. ท่าสาย',
      // ✅ ตั้งต้นเป็น Screened ยังไม่ส่งเข้าคิวหมอ จนกว่าจะกดส่งในหน้าผลลัพธ์
      status: 'Screened',
      updatedAt: formattedDate,
    };

    // Part 1 dosage criterion can independently require prescriber review.
    const doseAssessment = assessMetforminDose(currentPatient.egfr, parseMetforminDoseMg(currentPatient.metforminDose));
    if (doseAssessment.status !== 'within-range') {
      updatedPatient.nurseNote = `${doseAssessment.title}: ${doseAssessment.detail}`;
    }

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
        {step !== 'result' && (
          <WizardProgress
            currentStepIndex={stepIndex}
            currentLabel={STEP_LABELS[step]}
            stepLabels={STEP_ORDER.slice(0, 5).map((s) => STEP_LABELS[s])}
          />
        )}

        <div className="bg-white rounded-lg border border-[#E1E4DB] p-5 shadow-sm">
          {step === 'hn' && (
            <Step1ScanHN
              patients={patients}
              currentPatient={currentPatient}
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
      onEscalateToDoctor={() => {
        // ✅ เมื่อเจ้าหน้าที่กดปุ่มส่งใน LINE Card ถึงจะเปลี่ยนเป็น Escalated ส่งเข้าคิวหมอ
        const escalatedPatient: Patient = {
          ...currentPatient,
          status: 'Escalated',
          riskLevel: 'Red',
          nurseNote: 'จนท. รพ.สต. คัดกรองพบความเสี่ยงสูง ส่งการ์ดแจ้งเตือนผ่านกลุ่ม LINE',
          updatedAt: 'ส่งต่อด่วนเมื่อสักครู่',
        };
        onUpdatePatient(escalatedPatient);
      }}
    />
  )}
        </div>

        {/* ปุ่ม Back & Next */}
        {step !== 'result' && step !== 'hn' && (
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
