# G84 CineOS — Shot Runtime v1 Notes

## Ý tưởng lõi

Một shot không phải chỉ là:
- 1 ảnh
- 1 prompt
- 1 clip

Một shot là:
> một “thực thể sống” có ký ức.

Hệ thống phải nhớ:
- nhân vật đang đứng đâu
- cầm gì
- nhìn hướng nào
- ánh sáng ra sao
- cảnh trước nối sang thế nào
- editor sẽ cắt ở đâu

Nếu không:
- continuity vỡ
- AI mất trí nhớ giữa các shot
- editor rất khó dựng

---

# Tư duy “Sổ hộ khẩu của cảnh quay”

Mỗi shot phải có:

- mã cảnh
- cảm xúc cảnh
- ảnh mở đầu
- ảnh kết thúc
- camera quay kiểu gì
- nhân vật đứng đâu
- đạo cụ nằm đâu
- ánh sáng kiểu gì
- cảnh trước nối sang ra sao
- render xong chưa
- QA lỗi gì chưa

Đây là lõi của CineOS.

---

# Ký ức của phim

Ví dụ:

- Mina cầm tua vít tay trái ở cảnh 3
→ cảnh 4 phải còn cầm

- Mina nhìn sang phải
→ cảnh sau phải nối đúng hướng nhìn

- Trời đang mưa
→ nền cảnh sau vẫn phải ướt

Đây là:
> “ký ức của phim”.

---

# Start Frame / End Frame

Mỗi shot phải có:

## Start Frame
Khán giả nhìn thấy gì đầu tiên.

## End Frame
Khán giả nhớ gì cuối cùng.

AI rất dễ:
- nhảy cóc
- bỏ qua trạng thái đầu
- chỉ sinh “ảnh đẹp cuối cảnh”

Nên Start/End Frame là bắt buộc.

---

# Editor Handles

AI không dựng phim.
Editor dựng phim.

Vì vậy render phải có:
- đoạn dư đầu
- đoạn dư cuối
- khoảng thở cho editor cắt

Không render đúng nhịp cắt thì footage sẽ khó dựng.

---

# DNA Lock

Shot không tự chứa style.

Shot chỉ gọi:
- DNA lock
- style lock
- lighting lock

Ví dụ:

OCP1_NIGHT

Hệ thống tự hiểu:
- màu
- ánh sáng
- không khí
- texture
- prompt prefix

Mục tiêu:
> consistency toàn project.

---

# QA

QA không chỉ kiểm:
- mặt
- tay

Mà còn:
- continuity
- topology
- ánh sáng
- camera
- hành động
- file name
- JSON structure

---

# Render Lifecycle

Một shot có vòng đời:

DRAFT
→ READY
→ QUEUED
→ RENDERING
→ RENDERED
→ QA
→ APPROVED

Mục tiêu:
> Shot có trạng thái sống rõ ràng.

---

# Triết lý CineOS

CineOS không phải app render.

CineOS là:
> hệ thống giúp phim AI không bị mất trí nhớ.