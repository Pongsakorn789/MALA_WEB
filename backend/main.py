import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="MALA Screening API")


def get_allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class PatientData(BaseModel):
    age: int
    egfr: float
    metforminDose: float
    hasBingeDrinking: bool
    hasChronicAlcohol: bool
    hasVomitingDiarrhea: bool
    hasFasting: bool
    hasPainkillers: bool
    hasHerbsSupplements: bool


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/evaluate-mala-ai")
def evaluate_mala(data: PatientData):
    """Return fixed, reviewable guidance without downloading or running an AI model."""
    recommendations: list[str] = []

    if data.egfr < 45:
        recommendations.append(
            "ค่า eGFR ต่ำกว่า 45 ควรให้แพทย์ทบทวนความเหมาะสมและขนาดยา Metformin ตามแนวทางของหน่วยบริการ"
        )

    if data.hasBingeDrinking or data.hasChronicAlcohol:
        recommendations.append(
            "พบประวัติดื่มแอลกอฮอล์ตามเกณฑ์คัดกรอง แนะนำหลีกเลี่ยงการดื่มหนักและปรึกษาบุคลากรสุขภาพ"
        )

    if data.hasVomitingDiarrhea or data.hasFasting:
        recommendations.append(
            "หากอาเจียน ท้องเสีย หรือรับประทานอาหารและน้ำได้น้อย ให้ติดต่อ รพ.สต./แพทย์เพื่อรับคำแนะนำเรื่องยาระหว่างวันป่วยโดยเร็ว"
        )

    if data.hasPainkillers:
        recommendations.append(
            "พบการใช้ยาแก้ปวด/ยาแก้อักเสบ/ยาชุด ควรนำรายการยาปรึกษาแพทย์หรือเภสัชกรเพื่อทบทวนความเหมาะสม"
        )

    if data.hasHerbsSupplements:
        recommendations.append(
            "พบการใช้สมุนไพรหรืออาหารเสริม ควรแจ้งแพทย์หรือเภสัชกรและนำผลิตภัณฑ์หรือรายการส่วนประกอบไปให้ตรวจสอบ"
        )

    if not recommendations:
        recommendations.append(
            "ไม่พบปัจจัยกระตุ้นจากคำตอบที่บันทึก ควรใช้ยาและติดตามผลตามแผนของแพทย์ และแจ้งบุคลากรสุขภาพเมื่อมีอาการเจ็บป่วย"
        )

    return {
        "status": "success",
        "guidanceType": "rule-based",
        "recommendations": "\n".join(recommendations),
    }
