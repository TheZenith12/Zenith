# Zenith

Хувийн төсөл болон таск удирдлагын dashboard. Төсөл үүсгэх, дотор нь таск нэмэх, статус/тэргүүлэх зэрэглэл, дуусах хугацаа тавих, гүйцэтгэлийн явцаа графикаар харах боломжтой. Одоогоор нэг хэрэглэгчийн хувийн систем (team/organization загваргүй — Project, Task бүр зөвхөн нэг User-т хамаарна).

Энэ төслийг би ганцаараа, бие даан судалж хөгжүүлсэн. Өмнөх төслүүдээс ялгаатай нь энд Stripe биш **QPay** (Монголын QR төлбөрийн систем) ашиглаж, бодит invoice үүсгэх, webhook-аар баталгаажуулах, хэрэглэгчийн plan-ыг автоматаар идэвхжүүлэх урсгалыг өөрөө бүрэн бичсэн. Мөн authentication-аа (JWT, bcrypt, session, 2FA, OAuth) NextAuth-ийн үндсэн урсгалд шингээлгүй өөрөө бичиж, session удирдлагыг гараар хийж сурсан. Мөн Prisma-г local SQLite болон production дээр Turso (cloud libSQL) хоёуланд нь ажиллахаар тохируулсан.

## Технологи

- **Next.js** (App Router) + TypeScript
- **Prisma** (libSQL adapter) — local дээр SQLite файл, production дээр **Turso** cloud
- **Custom auth** — bcrypt password hashing, `jose`-оор JWT session, email verification, password reset, TOTP 2FA, Google/GitHub OAuth
- **QPay** — QR төлбөрийн интеграц (invoice, webhook callback, plan идэвхжүүлэлт)
- **Recharts** — аналитик график
- **Tailwind CSS**

## Юу хийдэг вэ

- **Auth** — бүртгэл, нэвтрэлт, имэйл баталгаажуулалт, нууц үг сэргээх, 2FA, Google/GitHub-ээр нэвтрэх
- **Төсөл/таск удирдлага** — төсөл үүсгэх, таск нэмэх, статус/priority/due date удирдах
- **Billing** — QPay-аар invoice үүсгэх, төлбөр баталгаажуулах, plan идэвхжүүлэх
- **Admin панель** — бүх хэрэглэгчийг харах, plan/эрх удирдах
- **Аналитик** — гүйцэтгэлийн хувь, өдөр тутмын идэвх, хугацаа хэтэрсэн даалгаврын график
- **Мэдэгдэл** — DB-д суурилсан notification, уншсан/уншаагүй төлөв
- **Blog, docs хуудас**, өгөгдөл export

## Сурсан зүйл

Энэ төслийг хийхдээ authentication-ийн бүх урсгалыг (нууц үг hash хийх, JWT signing/verification, session удирдлага, 2FA) өөрөө бичиж сурсан. Мөн QPay-тэй интеграц хийж, webhook secret баталгаажуулалт бүхий бодит төлбөрийн урсгал зохион бүтээж, Prisma-г local SQLite/production Turso хоёуланд нь адаптердах, Recharts ашиглан backend-ийн raw data-г ойлгомжтой график болгож харуулах дадлага хийсэн.
