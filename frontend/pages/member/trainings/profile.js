import { useAuth } from "../../lib/auth";

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="p-7 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-semibold">
                    {user?.name?.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>

                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                        Member
                    </span>

                    <p className="text-sm text-gray-500 mt-2">
                        Junior Entreprise ENIT · Tunis, Tunisia
                    </p>

                    <p className="text-sm text-gray-700 mt-2">
                        Passionate about technology and entrepreneurship. Always looking to learn and grow.
                    </p>
                </div>

                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    Edit profile
                </button>
            </div>

            {/* Info + Stats */}
            <div className="grid grid-cols-2 gap-6">
                {/* Personal info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 mb-4">
                        Personal Information
                    </h3>

                    <Info label="Full name" value={user?.name} />
                    <Info label="Email" value={user?.email} />
                    <Info label="Phone" value={user?.phone || "+216 XX XXX XXX"} />
                    <Info label="Department" value={user?.department || "Other"} />
                    <Info label="Member since" value="April 2026" />
                </div>

                {/* Learning stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 mb-4">
                        Learning Stats
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <StatBox number="0" label="Enrolled" />
                        <StatBox number="0" label="Completed" />
                        <StatBox number="0" label="In Progress" />
                        <StatBox number="0h" label="Hours learned" />
                    </div>
                </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 mb-4">
                    Recent Activity
                </h3>

                <Activity text="Account created" date="April 14, 2026" />
                <Activity
                    text="No trainings enrolled yet"
                    date="Browse trainings to get started"
                    muted
                />
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                {label}
            </p>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    );
}

function StatBox({ number, label }) {
    return (
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-xl font-semibold text-emerald-600">{number}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
    );
}

function Activity({ text, date, muted }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
            <div
                className={`w-2 h-2 mt-2 rounded-full ${muted ? "bg-gray-300" : "bg-emerald-600"
                    }`}
            />
            <div>
                <p className={`text-sm ${muted ? "text-gray-400" : "text-gray-800"}`}>
                    {text}
                </p>
                <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>
        </div>
    );
}