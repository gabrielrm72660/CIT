
import React from 'react';

export const STORAGE_KEY = 'cit_access_users_db';
export const THEME_KEY = 'cit_access_theme_pref';

export const STATUS_COLORS = {
  'Ativo': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  'Inativo': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  'Bloqueado': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  'Perdido': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
};

export const LINK_TYPE_COLORS = {
  'Terceirizado': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Servidor Público': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  'Estagiário': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  'Temporário': 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  'Cargo Comissionado': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};
