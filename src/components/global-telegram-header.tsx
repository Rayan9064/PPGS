'use client';

import Image from 'next/image';
import { useTelegram } from '@/components/providers/telegram-provider';

export const GlobalTelegramHeader = () => {
  const { tgUser } = useTelegram();
  if (!tgUser) return null;
  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-3">
      {tgUser.photo_url && (
        <Image
          src={tgUser.photo_url}
          alt="Telegram Avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
          onError={e => (e.currentTarget.style.display = 'none')}
          unoptimized
        />
      )}
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{tgUser.first_name} {tgUser.last_name}</div>
        {tgUser.username && <div className="text-xs text-gray-500 dark:text-gray-400">@{tgUser.username}</div>}
        <div className="text-xs text-gray-400 dark:text-gray-500">Telegram ID: {tgUser.id}</div>
      </div>
    </div>
  );
}
