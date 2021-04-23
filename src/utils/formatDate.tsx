import { format } from 'date-fns';
import brazilianLocale from 'date-fns/locale/pt-BR';

export function formatDate(ISODate: string): string {
  return format(new Date(ISODate), 'dd MMM yyyy', {
    locale: brazilianLocale,
  });
}
