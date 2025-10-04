# Troubleshooting Guide - FinanceFlow

## Masalah: Data Tidak Tampil di Transactions/Todos/Events

Jika data tidak tampil di halaman Transactions, Todos, atau Events, ikuti langkah berikut:

### 1. Periksa Row Level Security (RLS) di Supabase

Aplikasi ini menggunakan RLS untuk keamanan. Pastikan Anda sudah membuat policies yang benar:

#### Untuk Transactions:
```sql
-- Policy untuk SELECT
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy untuk INSERT
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk UPDATE
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk DELETE
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Untuk Todos:
```sql
-- Policy untuk SELECT
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy untuk INSERT
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk UPDATE
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk DELETE
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Untuk Events:
```sql
-- Policy untuk SELECT
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy untuk INSERT
CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk UPDATE
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk DELETE
CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Untuk Notes:
```sql
-- Policy untuk SELECT
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy untuk INSERT
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk UPDATE
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk DELETE
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Periksa Browser Console

Buka Developer Tools (F12) di browser dan periksa tab Console. Jika ada error, Anda akan melihat alert dengan pesan error yang jelas.

### 3. Periksa Network Tab

Di Developer Tools, buka tab Network dan filter dengan "supabase". Periksa response dari API calls untuk melihat error details.

### 4. Verifikasi User Authentication

Pastikan user sudah login dan `user.id` cocok dengan `user_id` di database.

## Perubahan yang Sudah Dilakukan

### 1. Logo
- Logo sudah diganti menggunakan file `/public/logo_circular_frame_white.png`
- Logo tampil di sidebar (Layout) dan halaman login (Auth)

### 2. Mobile Responsiveness
- Semua button dan text sudah responsif
- Sidebar navigation sudah responsif dengan hamburger menu
- Table menggunakan `overflow-x-auto` untuk scroll horizontal di mobile
- Font size menyesuaikan ukuran layar dengan class `text-sm sm:text-base`

### 3. Error Handling
- Ditambahkan alert untuk menampilkan error message
- Console.log untuk debugging
- Improved error messages

### 4. Tags Support
- Notes sudah support multiple tags per note
- Tags bisa dipisahkan dengan koma
- Tags bisa dicari dan difilter

## Tips Debugging

1. **Cek apakah RLS enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

2. **Cek policies yang ada:**
```sql
SELECT * FROM pg_policies
WHERE tablename IN ('transactions', 'todos', 'events', 'notes');
```

3. **Test query manual di SQL Editor:**
```sql
SELECT * FROM transactions WHERE user_id = 'YOUR_USER_ID';
```

4. **Cek apakah ada trigger yang memblokir:**
```sql
SELECT * FROM pg_trigger
WHERE tgrelid IN (
  SELECT oid FROM pg_class
  WHERE relname IN ('transactions', 'todos', 'events', 'notes')
);
```

## Fitur Yang Sudah Berfungsi

✅ Authentication (Login/Register)
✅ Profile Management
✅ Notes dengan multiple tags
✅ Dark/Light Mode
✅ Data Export (JSON & CSV)
✅ Mobile Responsive UI
✅ Logo custom

## Fitur Yang Mungkin Bermasalah (Perlu RLS Setup)

⚠️ Transactions CRUD
⚠️ Todos CRUD
⚠️ Events CRUD
⚠️ Dashboard Charts

Semua fitur ini akan langsung berfungsi setelah RLS policies dibuat dengan benar.
