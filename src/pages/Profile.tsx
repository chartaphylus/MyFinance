import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Phone, Save, Download, Camera, Link as LinkIcon } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
      });
      setMessage("Profile updated successfully!");
    } catch (error: any) {
      setMessage("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0];
      if (!file || !profile) return;

      const fileName = `${profile.id}/${Date.now()}.${file.name.split(".").pop()}`;

      // Upload file
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Ambil URL publik
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // Simpan ke state
        setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));

        // Update profile
        await updateProfile({ avatar_url: publicUrl });

        setMessage("Profile photo updated!");
    } catch (error: any) {
      setMessage("Error uploading photo: " + error.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function exportData(format: "json" | "csv") {
    setExportLoading(true);
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", profile!.id);

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", profile!.id);

      const { data: todos } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", profile!.id);

      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", profile!.id);

      const exportData = {
        profile,
        transactions: transactions || [],
        events: events || [],
        todos: todos || [],
        notes: notes || [],
        exported_at: new Date().toISOString(),
      };

      if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financeflow-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        let csv = "Type,Date,Category,Amount,Description\n";
        transactions?.forEach((t) => {
          csv += `${t.type},${t.transaction_date},${t.category},${t.amount},"${
            t.description || ""
          }"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financeflow-transactions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setMessage("Data exported successfully!");
    } catch (error: any) {
      setMessage("Error exporting data: " + error.message);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("Error")
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-green-500/20 text-green-400 border border-green-500/40"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={formData.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border border-slate-700 shadow"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full hover:bg-cyan-500 transition"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="Or paste image URL"
                  className="text-sm border rounded px-2 py-1 w-48 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-11 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Member since</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Last updated</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Account status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Export Data
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Download all your financial data for backup or analysis.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => exportData("json")}
                disabled={exportLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{exportLoading ? "Exporting..." : "Export as JSON"}</span>
              </button>
              <button
                onClick={() => exportData("csv")}
                disabled={exportLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{exportLoading ? "Exporting..." : "Export Transactions as CSV"}</span>
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
            <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-400 mb-2">Data Privacy</h3>
            <p className="text-xs text-cyan-700 dark:text-cyan-300">
              Your financial data is encrypted and secure. We never share your information with third
              parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}