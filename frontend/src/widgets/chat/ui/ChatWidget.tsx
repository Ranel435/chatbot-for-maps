import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../../shared/ui';
import { MessageBubble } from '../../../entities/message';
import { ChatInput, useChat } from '../../../features/send-message';
import { useRouteStore, useBuildRouteFromPOIs } from '../../../entities/route';
import { useToast } from '../../../shared/lib';
import type { POI } from '../../../shared/types';

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className }: ChatWidgetProps) {
  const navigate = useNavigate();
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();
  const buildRouteMutation = useBuildRouteFromPOIs();
  const toast = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBuildRoute = useCallback(
    (pois: POI[]) => {
      const poiIds = pois.map((p) => p.id);
      buildRouteMutation.mutate(
        { poi_ids: poiIds, mode: 'walking' },
        {
          onSuccess: (data) => {
            setCurrentRoute(data.route);
            setRoutePOIs(data.pois);
            toast.success(`Маршрут построен: ${data.route.distance_km.toFixed(1)} км`);
            navigate('/route');
          },
          onError: () => {
            toast.error('Не удалось построить маршрут');
          },
        }
      );
    },
    [buildRouteMutation, setCurrentRoute, setRoutePOIs, toast, navigate]
  );

  return (
    <div className={className}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">MapBot</h2>
          <p className="text-sm text-white/60">Спросите о местах или маршрутах</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 py-8">
              <p className="text-lg mb-2 text-white">Привет!</p>
              <p className="text-sm">
                Спросите меня о исторических местах Москвы или попросите построить маршрут.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-white/40">Попробуйте:</p>
                <p>"Покажи старые церкви"</p>
                <p>"Построй маршрут по усадьбам"</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onBuildRoute={handleBuildRoute}
            />
          ))}

          {(isLoading || buildRouteMutation.isPending) && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <Spinner size="sm" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}










