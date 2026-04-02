<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
<!-- NEXT_ENTRY_HERE -->

## 2026-03-26 (Fix PrinterSimple icon)
- `PrinterSimple` không tồn tại trong `@phosphor-icons/react` → đổi thành `Printer`
- File: `src/components/danhmuc/BBBGManager.tsx`

## 2026-03-26 (SEO Setup)
- Rewrote `index.html`: lang="vi", optimized title, full meta/og/twitter/robots/JSON-LD tags
- Created `public/site.webmanifest` (PWA manifest, theme color, icons)
- Created `public/sitemap.xml` (all hash routes), `public/robots.txt` (allow all + Sitemap URL)
- Created `public/llms.txt` describing the project for LLM crawlers

## 2026-03-26 (Fix font tiếng Việt)
- Xoá `@font-face` ITCKabelStd (không hỗ trợ Unicode/tiếng Việt)
- Đổi sang `Inter` (body) + `Nunito` (heading) qua Google Fonts — hỗ trợ đầy đủ dấu tiếng Việt
- Cập nhật `--font-sans`, `--font-heading` trong `src/index.css` và `tailwind.config.js`

## 2026-03-26 (Monopoly Fonts)
- Thêm `@font-face` cho `ITCKabelStd` Bold + Book từ URL Anima CDN vào `src/index.css`
- Đặt `ITCKabelStd` làm font chính cho `--font-sans` và `--font-heading` (fallback: Nunito/Poppins)
- Cập nhật `tailwind.config.js` fontFamily tương ứng

## 2026-03-26 (Login Screen Retro Theme)
- Áp dụng theme retro cam + navy vào `src/components/LoginScreen.tsx`
- Nền `hsl(220,28%,8%)` navy sâu, card `hsl(220,30%,12%)`, input `hsl(220,28%,10%)`
- Accent line cam gradient trên đầu card, icon logo viền cam + glow
- Nút submit màu cam `hsl(28,100%,55%)` với chữ đậm navy, label uppercase tracking-widest

## 2026-03-26 (Retro Orange + Dark Navy Theme)
- Đổi toàn bộ màu sắc sang retro: nền `hsl(220,28%,10%)` xanh đậm navy, chữ `hsl(38,80%,92%)` kem vàng
- Primary cam `hsl(28,100%,55%)`, sidebar `hsl(220,35%,8%)` gần đen, card `hsl(220,30%,13%)`
- Border-radius giảm xuống (3/5/7/9px) cho cảm giác retro góc vuông
- Metric gradient cards đổi sang tông retro tối + border highlight
- Card hover: glow cam thay thế shadow trắng; scrollbar thumb hover → cam
- Cập nhật cả `tailwind.config.js` và `src/index.css`

## 2026-03-26 (HCC in CommandPalette)
- Thêm `useQuery('HCC')` vào `src/components/CommandPalette.tsx`
- Tìm kiếm HCC theo: maHs, tenDonViNhan, maDonViNhan, nguoiNhan, chiTiet
- Kết quả HCC hiển thị với icon ShareNetwork màu tím, click → navigate đến section `hcc`

## 2026-03-26 (Download Database)
- Thêm nút "Xuất DB" vào Desktop TopBar header
- Hook `useDownloadDatabase` dùng `useLazyQuery` để fetch song song tất cả 6 entity (HoSoTNHS, HoSoNQT, HCC, DonVi, ThuTuc, NgayLe)
- Xuất JSON file `QLHS_database_YYYY-MM-DD.json` bằng Blob + URL.createObjectURL, loading state với spinner

## 2026-03-26 (Thay avatar người dùng)
- Sidebar user section: thay icon `<User>` bằng monogram avatar (chữ cái đầu tên, gradient cam)
- File thay đổi: `src/components/layout/TopBar.tsx`

## 2026-03-26 (Thêm màn hình đăng nhập)
- Tạo `src/components/LoginScreen.tsx`: form đăng nhập với gradient BHXH, show/hide password, loading state, error message
- Thêm `isLoggedIn`, `login()`, `logout()` vào `AppContext`; credentials tĩnh: `trangth / Trangth2026@#$`
- `AppShell` trong `App.tsx` render `LoginScreen` nếu chưa đăng nhập, hiển thị app khi đã đăng nhập

## 2026-03-13 (Fix HCCManager syntax error)
- `DonViAutocomplete` component định nghĩa bị lẫn vào giữa JSX pagination trong `HCCManager.tsx`
- Chuyển `DonViAutocomplete` lên trước `HCCManager` (top-level) để fix lỗi "Unexpected token" dòng 354

## 2026-03-13 (HCC enhancements)
- Mã HS và Tên đơn vị nhận có thể để trống khi thêm/sửa HCC
- Thêm `DonViAutocomplete`: nhập mã đơn vị nhận → tự động điền tên đơn vị từ danh mục DonVi
- Autocomplete có dropdown gợi ý (filter theo mã + tên), áp dụng cả form thêm mới và edit inline

## 2026-03-12 (Fix syntax error HCCImportModal)
- Sửa lỗi cú pháp dòng 281 trong `src/components/danhmuc/HCCImportModal.tsx`: `)` → `]`

## 2026-03-12 (Cập nhật tài khoản admin)
- Đổi tên admin: `Admin Hệ thống` → `admin`, email: `admin@bhxh.gov.vn` → `trangth@`
- Cập nhật cả `src/context/AppContext.tsx` (LOCAL_USER) và `src/components/users/UserManager.tsx` (INITIAL_USERS)

## 2026-03-12 (Import CSV đơn vị)
- Thêm nút "Import CSV" vào `src/components/danhmuc/DonViManager.tsx`
- 3 bước: upload (drag-drop + chọn file) → preview có thể sửa/xóa từng dòng → done với progress bar
- Tự động validate (mã/tên bắt buộc), hiển thị lỗi inline, bỏ qua hàng lỗi khi import
- Hỗ trợ tải file mẫu CSV để hướng dẫn người dùng

## 2026-03-12 (Hero banner: xoá ảnh, đổi theme Figma)
- Xoá `<img>` nền khỏi Hero Banner trong `src/components/dashboard/Dashboard.tsx`
- Thay bằng gradient CSS thuần `#0f2554 → #1a3a8f → #1e56c9` kiểu Figma
- Thêm decorative circles + grid pattern overlay để tạo chiều sâu

## 2026-03-12 (Báo cáo & Trang quản lý)
- Thêm `ActiveSection` mới: `baocao`; cập nhật `src/types/index.ts`, `TopBar`, `App.tsx`, `Dashboard`
- Tạo mới `src/components/dashboard/BaoCaoDashboard.tsx`: KPI cards, donut chart, bar chart, monthly trend, progress bars
- Charts tự build bằng SVG/CSS thuần (không dùng thư viện ngoài)
- Dashboard quickactions thêm "Báo cáo & Thống kê" link

## 2026-03-11 (SDK Refactor + HCC)
- Added `@animaapp/playground-react-sdk` 0.10.0; wrapped app with `AnimaProvider` in `src/index.tsx`
- Refactored all data hooks to use `useQuery`/`useMutation` (HoSoTNHS, HoSoNQT, DonVi, ThuTuc, NgayLe)
- Removed mock data lists from `src/data/mockData.ts`; stripped `AppContext` to UI-only state
- Added new `src/components/danhmuc/HCCManager.tsx` with search, month filter, pagination, CRUD
- Updated `ActiveSection` type + `TopBar` + `App.tsx` to include `hcc` route; `Dashboard` quick actions updated

## 2026-03-11 (latest)
- Sắp xếp lại thứ tự trường trong HoSoForm khớp với thứ tự cột bảng
- Thứ tự form: Mã HS → Mã BHXH → Họ tên → Đơn vị → Chuyên quản → Thủ tục → Tiếp nhận → Hẹn trả → Ghi chú

## 2026-03-11
- Thêm trường `ho_ten` vào `HoSoTNHS`, `HoSoNQT` (types/index.ts, mockData.ts)
- Thứ tự cột: Mã HS → Mã BHXH → Họ tên → Đơn vị → Thủ tục → Tiếp nhận → Hẹn trả → Chuyên quản → Ghi chú
- Cập nhật HoSoForm, HoSoTable (12 cột), DetailDrawer, CSV export

## 2026-03-11
<changelog>
<!-- NEXT_ENTRY_HERE -->

## 2026-03-11 (latest)
- Thêm trường `ho_ten` vào `HoSoTNHS`, `HoSoNQT` (types/index.ts, mockData.ts)
- Thứ tự cột: Mã HS → Mã BHXH → Họ tên → Đơn vị → Thủ tục → Tiếp nhận → Hẹn trả → Chuyên quản → Ghi chú
- Cập nhật HoSoForm, HoSoTable (12 cột), DetailDrawer, CSV export

## 2026-03-11
- Updated `src/components/hoso/HoSoForm.tsx`: đơn vị linh hoạt (chọn danh sách / nhập tay / bỏ trống)
- Mã hồ sơ tự động generate nhưng có thể edit bằng nút bút chì
- Ngày hẹn trả tự tính read-only, chuyên quản editable khi nhập tay đơn vị
</changelog>
