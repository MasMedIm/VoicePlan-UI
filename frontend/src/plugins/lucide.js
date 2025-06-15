// Plugin to register selected Lucide icons globally
// We only register icons actually used in the UI to keep bundle size minimal.
import { Mic, CalendarDays, Link as LinkIcon, Image as ImageIcon, ListTodo, Book } from 'lucide-vue-next';

export default function installIcons(app) {
  const icons = {
    Mic,
    CalendarDays,
    LinkIcon,
    ImageIcon,
    ListTodo,
    Book,
  };

  Object.entries(icons).forEach(([name, component]) => {
    app.component(name, component);
  });
}
