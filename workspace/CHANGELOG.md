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
