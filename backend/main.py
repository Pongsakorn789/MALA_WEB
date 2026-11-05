from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- เพิ่ม CORS
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

app = FastAPI()

# 1. ป้องกัน Error 405 Method Not Allowed โดยเปิดให้ Frontend (React) ยิง Request เข้ามาได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # อนุญาตทุก Origin (หรือใส่เฉพาะ domain เช่น http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],            # อนุญาตทุก HTTP Method (GET, POST, OPTIONS, ฯลฯ)
    allow_headers=["*"],            # อนุญาตทุก Header
)

# ใช้โมเดลที่คุณ Fine-tune และอัปโหลดขึ้น Hugging Face
MODEL_NAME = "Pongsakorn789/mala-cpg-assistant-model"

# ค้นหาช่วงนี้ในโค้ดของคุณ:
print("⏳ กำลังโหลดโมเดล MALA CPG Assistant เข้าสู่ระบบ...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)

# 💡 เปลี่ยนเป็นแบบนี้ครับ:
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    dtype=torch.float16,
    device_map="cuda:0",
    trust_remote_code=True
)

mala_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)


# 2. ปรับโครงสร้างข้อมูลผู้ป่วยตาม CPG เช็คลิสต์ชุดใหม่ (ข้อ 9 - 13)
class PatientData(BaseModel):
    age: int
    egfr: float
    metforminDose: float           # ขนาดยา Metformin (mg/day)
    hasBingeDrinking: bool         # ข้อ 9.2.1 ดื่มหนักช่วงเวลาอันสั้น
    hasChronicAlcohol: bool        # ข้อ 9.2.2 ดื่มเป็นประจำ/ต่อเนื่อง
    hasVomitingDiarrhea: bool      # ข้อ 10 อาเจียน/ท้องเสีย
    hasFasting: bool               # ข้อ 11 ทานอาหารไม่ได้/ทานน้อยลง 1-2 วัน
    hasPainkillers: bool           # ข้อ 12 ยาแก้ปวด/แก้อักเสบ/ยาชุด
    hasHerbsSupplements: bool      # ข้อ 13 ยาต้ม/ยาหม้อ/สมุนไพร/อาหารเสริม


@app.post("/api/evaluate-mala-ai")
def evaluate_mala_with_ai(data: PatientData):
    # จัดรูปแบบ Prompt ส่งให้ AI ประเมินตาม CPG Checklist ล่าสุด
    prompt = (
        f"### คำสั่ง:\nให้คำแนะนำผู้ป่วยเบาหวานเพื่อป้องกัน MALA ตามหลัก CPG\n\n"
        f"### ข้อมูลผู้ป่วย:\n"
        f"- อายุ: {data.age} ปี, eGFR: {data.egfr} mL/min, ยา Metformin: {data.metforminDose} mg/วัน\n"
        f"- ประวัติแอลกอฮอล์: ดื่มหนักสั้นๆ = {data.hasBingeDrinking}, ดื่มหนักต่อเนื่อง = {data.hasChronicAlcohol}\n"
        f"- อาการกระตุ้น: อาเจียน/ท้องเสีย = {data.hasVomitingDiarrhea}, ขาดอาหาร 1-2 วัน = {data.hasFasting}\n"
        f"- ความเสี่ยงยาอื่น: ยาแก้ปวด/ยาชุด = {data.hasPainkillers}, ยาสมุนไพร/อาหารเสริม = {data.hasHerbsSupplements}\n\n"
        f"### คำแนะนำ:\n"
    )
    
    # สั่งให้โมเดลสร้างคำแนะนำ
    response = mala_pipeline(
        prompt, 
        max_new_tokens=150, 
        temperature=0.5,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    generated_text = response[0]['generated_text']
    
    # ตัดเอาเฉพาะส่วนที่เป็นคำตอบหลังคำว่า ### คำแนะนำ:
    recommendation = generated_text.split("### คำแนะนำ:")[-1].strip()
    
    return {
        "status": "success",
        "modelUsed": MODEL_NAME,
        "aiRecommendations": recommendation
    }