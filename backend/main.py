from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

app = FastAPI()

# ใช้โมเดลที่คุณ Fine-tune และอัปโหลดขึ้น Hugging Face เมื่อครู่
MODEL_NAME = "Pongsakorn789/mala-cpg-assistant-model"

print("⏳ กำลังโหลดโมเดล MALA CPG Assistant เข้าสู่ระบบ...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    trust_remote_code=True
)

# สร้าง Pipeline สำหรับสร้างข้อความแนะนำทางการแพทย์
mala_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

# โครงสร้างข้อมูลที่รับมาจาก Frontend (React)
class PatientData(BaseModel):
    age: int
    egfr: float
    hasDehydration: bool
    hasAlcohol: bool

@app.post("/api/evaluate-mala-ai")
def evaluate_mala_with_ai(data: PatientData):
    # จัดรูปPrompt ให้ตรงกับตอนที่เราใช้เทรน
    prompt = (
        f"### คำสั่ง:\nให้คำแนะนำผู้ป่วยเบาหวานเพื่อป้องกัน MALA ตามหลัก CPG\n\n"
        f"### ข้อมูลผู้ป่วย:\nอายุ: {data.age}, eGFR: {data.egfr}, ภาวะขาดน้ำ: {data.hasDehydration}, ดื่มแอลกอฮอล์: {data.hasAlcohol}\n\n"
        f"### คำแนะนำ:\n"
    )
    
    # สั่งให้โมเดลสร้างคำแนะนำ
    response = mala_pipeline(
        prompt, 
        max_new_tokens=300,  # <-- ลดเหลือ 150 จะช่วยให้ AI ตอบเสร็จไวขึ้นครึ่งหนึ่ง
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