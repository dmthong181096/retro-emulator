# 🎮 Retro Console Emulator

Một ứng dụng web React.js để giả lập các máy console game cổ điển sử dụng EmulatorJS.

## ✨ Tính năng

- 🎯 Hỗ trợ nhiều console: NES, SNES, Game Boy, GBA, Sega Genesis, PlayStation 1
- 🎮 Giao diện thân thiện và responsive
- 📱 Tương thích với mobile và desktop
- 🎨 Thiết kế retro với hiệu ứng đẹp mắt
- 🔄 Tải ROM files trực tiếp từ trình duyệt
- ⚖️ Tôn trọng bản quyền - không cung cấp ROM files

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd retro-console-emulator
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm start
```

4. Mở trình duyệt và truy cập: `http://localhost:3000`

## 📁 Cấu trúc project

```
retro-console-emulator/
├── public/
│   ├── roms/          # Thư mục chứa ROM files
│   ├── bios/          # Thư mục chứa BIOS files
│   └── index.html     # HTML template với EmulatorJS
├── src/
│   ├── components/    # React components
│   │   └── Header.js
│   ├── pages/         # Các trang chính
│   │   ├── Home.js
│   │   ├── EmulatorPage.js
│   │   └── GameLibrary.js
│   ├── App.js         # Component chính
│   └── App.css        # Styles chính
└── package.json
```

## 🎮 Console được hỗ trợ

| Console | Định dạng ROM | Mô tả |
|---------|---------------|-------|
| NES | .nes | Nintendo Entertainment System |
| SNES | .smc, .sfc | Super Nintendo |
| Game Boy | .gb, .gbc | Game Boy và Game Boy Color |
| GBA | .gba | Game Boy Advance |
| Genesis | .md, .gen | Sega Genesis/Mega Drive |
| PlayStation 1 | .bin, .iso | Sony PlayStation 1 |

## 🕹️ Cách sử dụng

1. **Chọn Console**: Từ trang chủ, click vào console bạn muốn chơi
2. **Tải ROM**: Sử dụng nút "Choose File" để tải ROM game
3. **Chơi Game**: Game sẽ tự động khởi chạy sau khi tải ROM
4. **Điều khiển**: 
   - Mũi tên: Di chuyển
   - Z: Nút A/Action
   - X: Nút B/Jump
   - Enter: Start
   - Shift: Select
   - F11: Toàn màn hình

## ⚖️ Lưu ý pháp lý

- Project này chỉ cung cấp emulator, không bao gồm ROM files
- Bạn chỉ nên sử dụng ROM từ các game bạn sở hữu hợp pháp
- Tuân thủ luật bản quyền trong khu vực của bạn

## 🛠️ Công nghệ sử dụng

- **React.js**: Framework frontend
- **React Router**: Routing
- **EmulatorJS**: Engine emulation
- **CSS3**: Styling với gradient và animations

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🎯 Roadmap

- [ ] Thêm hỗ trợ cho nhiều console khác
- [ ] Tính năng save/load state
- [ ] Multiplayer online
- [ ] Tùy chỉnh controls
- [ ] Thêm cheats/game genie
- [ ] PWA support cho mobile

---

Được tạo với ❤️ bởi React và EmulatorJS