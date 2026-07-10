import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, Trash2 } from 'lucide-react';

moment.locale('fr');
const localizer = momentLocalizer(moment);

// Liste des cellules (valeurs identiques à l'enum Training.category côté backend)
const CELL_OPTIONS = [
  { label: 'Marketing', value: 'Marketing' },
  { label: 'DevCo', value: 'DevCo' },
  { label: 'Projet', value: 'Projet' },
  { label: 'Affaires Internationales', value: 'Affaires Internationales' },
  { label: 'Qualité', value: 'Qualité' },
  { label: 'IT', value: 'IT' },
  { label: 'Toutes les cellules', value: 'Toutes les cellules' },
];

const CELL_LABELS = CELL_OPTIONS.reduce((acc, c) => ({ ...acc, [c.value]: c.label }), {});

const CALENDAR_MESSAGES = {
  next: 'Suivant',
  previous: 'Précédent',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Liste',
  date: 'Date',
  time: 'Heure',
  event: 'Formation',
  noEventsInRange: 'Aucune formation programmée sur cette période.',
};

const emptyForm = {
  title: '',
  description: '',
  category: 'Marketing',
  duration: 60,
  instructor: '',
  scheduledDate: '',
  scheduledTime: '09:00',
  color: '#28374d',
};

// Petite aide pour comparer deux dates au jour près
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function AdminAgenda() {
  const [trainings, setTrainings] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [markDate, setMarkDate] = useState(null);
  const [markColor, setMarkColor] = useState('#3ec0c7');
  const [markLabel, setMarkLabel] = useState('');
  const [markSaving, setMarkSaving] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/trainings'),
      api.get('/calendar-marks'),
    ])
      .then(([trainingsRes, marksRes]) => {
        setTrainings(trainingsRes.data.trainings || []);
        setMarks(marksRes.data.marks || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Ne garder que les formations qui ont une date programmée, pour l'affichage calendrier
  const events = trainings
    .filter((t) => t.scheduledDate)
    .map((t) => {
      const start = new Date(t.scheduledDate);
      const end = new Date(start.getTime() + (t.duration || 60) * 60000);
      return {
        id: t._id,
        title: `${t.title} — ${CELL_LABELS[t.category] || t.category}`,
        start,
        end,
        resource: t,
      };
    });

  // ── Formulaire de création de formation ──────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.scheduledDate) {
      setError('Merci de remplir au moins le titre, la description et la date.');
      return;
    }

    const scheduledDate = new Date(`${form.scheduledDate}T${form.scheduledTime || '09:00'}`);

    setSaving(true);
    try {
      await api.post('/trainings', {
        title: form.title,
        description: form.description,
        category: form.category,
        duration: Number(form.duration) || 60,
        instructor: form.instructor,
        scheduledDate,
        color: form.color,
      });
      setModalOpen(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Une erreur est survenue lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  // ── Coloration d'un jour vide (clic sur une case du calendrier) ──
  const handleSelectSlot = (slotInfo) => {
    const clicked = slotInfo.start;
    const existingMark = marks.find((m) => sameDay(new Date(m.date), clicked));
    setMarkDate(clicked);
    setMarkColor(existingMark ? existingMark.color : '#3ec0c7');
    setMarkLabel(existingMark ? existingMark.label : '');
    setMarkModalOpen(true);
  };

  const currentMark = markDate
    ? marks.find((m) => sameDay(new Date(m.date), markDate))
    : null;

  const handleSaveMark = async () => {
    setMarkSaving(true);
    try {
      await api.post('/calendar-marks', {
        date: markDate,
        color: markColor,
        label: markLabel,
      });
      setMarkModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la coloration du jour.');
    } finally {
      setMarkSaving(false);
    }
  };

  const handleDeleteMark = async () => {
    if (!currentMark) return;
    setMarkSaving(true);
    try {
      await api.delete(`/calendar-marks/${currentMark._id}`);
      setMarkModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setMarkSaving(false);
    }
  };

  // Applique la couleur de fond aux jours marqués (vue mois)
  const dayPropGetter = (date) => {
    const mark = marks.find((m) => sameDay(new Date(m.date), date));
    if (!mark) return {};
    return {
      style: {
        backgroundColor: `${mark.color}26`, // ~15% d'opacité
      },
    };
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-navy-900 text-xl">Agenda des formations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Planifiez et visualisez toutes les formations à venir
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-teal flex items-center gap-2"
        >
          <Plus size={18} /> Nouvelle formation
        </button>
      </div>

      <div className="card">
        <style>{`
          .rbc-calendar, .rbc-calendar * {
            font-family: 'Montserrat', sans-serif !important;
          }
          .rbc-today {
            background-color: transparent !important;
          }
          .rbc-day-bg:hover {
            cursor: pointer;
            filter: brightness(0.97);
          }
          .rbc-toolbar-label {
            font-weight: 700;
            font-size: 1.15rem;
            color: #28374d;
          }
          .rbc-toolbar button {
            background: #3ec0c7 !important;
            color: #fff !important;
            border: none !important;
            font-weight: 600;
            padding: 8px 16px;
            transition: background 0.15s;
          }
          .rbc-btn-group {
            border-radius: 0.75rem;
            overflow: hidden;
            display: inline-flex;
          }
          .rbc-btn-group button + button {
            border-left: 2px solid #fff !important;
          }
          .rbc-toolbar button:hover,
          .rbc-toolbar button:focus,
          .rbc-toolbar button:active {
            background: #26384F !important;
            color: #fff !important;
          }
          .rbc-today {
            background-color: transparent !important;
          }
          .rbc-toolbar-label {
            font-weight: 700 !important;
            font-size: 1.15rem !important;
          }
          .rbc-toolbar button.rbc-active,
          .rbc-toolbar button[aria-pressed="true"],
          .rbc-toolbar .rbc-btn-group button.rbc-active {
            background: #26384F !important;
            color: #fff !important;
            box-shadow: none !important;
            border-color: #26384F !important;
          }
        `}</style>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
          </div>
        ) : (
          <div style={{ height: 650 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              messages={CALENDAR_MESSAGES}
              selectable
              onSelectSlot={handleSelectSlot}
              dayPropGetter={dayPropGetter}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource?.color || '#28374d',
                  borderRadius: '6px',
                  border: 'none',
                  color: '#fff',
                },
              })}
            />
          </div>
        )}
      </div>

      {/* Modal de création de formation */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card-hover relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy-900"
            >
              <X size={20} />
            </button>

            <h2 className="font-display font-bold text-navy-900 text-lg mb-4">
              Nouvelle formation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Titre</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: Introduction au Design Thinking"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="Objectifs et contenu de la formation"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={form.scheduledDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Heure</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={form.scheduledTime}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Durée (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    min={0}
                    value={form.duration}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Formateur</label>
                  <input
                    name="instructor"
                    value={form.instructor}
                    onChange={handleChange}
                    className="input"
                    placeholder="Nom du formateur"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="label">Cellule</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="input"
                  >
                    {CELL_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-[42px] h-[42px] rounded-xl border border-slate-200 cursor-pointer p-0.5 flex-shrink-0"
                  title="Choisir une couleur"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
                {saving ? 'Création en cours…' : 'Créer la formation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de coloration d'un jour */}
      {markModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-card-hover relative">
            <button
              onClick={() => setMarkModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy-900"
            >
              <X size={20} />
            </button>

            <h2 className="font-display font-bold text-navy-900 text-lg mb-1">
              Colorer ce jour
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {markDate && moment(markDate).format('dddd D MMMM YYYY')}
            </p>

            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="label">Libellé (optionnel)</label>
                  <input
                    value={markLabel}
                    onChange={(e) => setMarkLabel(e.target.value)}
                    className="input"
                    placeholder="Ex: Jour férié, Congé…"
                  />
                </div>
                <input
                  type="color"
                  value={markColor}
                  onChange={(e) => setMarkColor(e.target.value)}
                  className="w-[42px] h-[42px] rounded-xl border border-slate-200 cursor-pointer p-0.5 flex-shrink-0"
                  title="Choisir une couleur"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveMark}
                  disabled={markSaving}
                  className="btn-primary flex-1"
                >
                  {markSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                {currentMark && (
                  <button
                    onClick={handleDeleteMark}
                    disabled={markSaving}
                    className="btn-outline px-3"
                    title="Supprimer la couleur"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}