import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { useMessageStore } from '../../../entities/message';
import { useRouteStore } from '../../../entities/route';
import type { Coordinate } from '../../../shared/types';

export function useChat() {
  const { messages, addMessage, setLoading, isLoading } = useMessageStore();
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();

  const chatMutation = useMutation({
    mutationFn: ({ query, location }: { query: string; location?: Coordinate }) =>
      api.chat(query, location),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      addMessage({
        role: 'assistant',
        content: data.message,
        data: data.data,
      });

      if (data.intent === 'ROUTE' && data.data && 'route' in data.data) {
        setCurrentRoute(data.data.route);
        setRoutePOIs(data.data.pois);
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const sendMessage = useCallback(
    (text: string, location?: Coordinate) => {
      addMessage({
        role: 'user',
        content: text,
      });
      chatMutation.mutate({ query: text, location });
    },
    [addMessage, chatMutation]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    error: chatMutation.error,
  };
}










