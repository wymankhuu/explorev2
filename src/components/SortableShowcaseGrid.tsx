'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { App } from '@/lib/types';
import AppCard from './AppCard';

interface SortableShowcaseGridProps {
  apps: App[];
  password: string;
  starCounts: Record<string, number>;
  starred: Set<string>;
  onToggleStar: (id: string) => void;
  onAppClick: (app: App) => void;
  searchQuery?: string;
  isAdminMode: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
}

function SortableCard({
  app,
  starCount,
  isStarred,
  onToggleStar,
  onClick,
  searchQuery,
  isAdminMode,
  isSelected,
  onSelectToggle,
}: {
  app: App;
  starCount: number;
  isStarred: boolean;
  onToggleStar: () => void;
  onClick: () => void;
  searchQuery?: string;
  isAdminMode: boolean;
  isSelected: boolean;
  onSelectToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppCard
        app={app}
        onClick={onClick}
        starCount={starCount}
        isStarred={isStarred}
        onToggleStar={onToggleStar}
        searchQuery={searchQuery}
        isAdminMode={isAdminMode}
        isSelected={isSelected}
        onSelectToggle={onSelectToggle}
        showDragHandle={isAdminMode}
      />
    </div>
  );
}

export default function SortableShowcaseGrid({
  apps: initialApps,
  password,
  starCounts,
  starred,
  onToggleStar,
  onAppClick,
  searchQuery,
  isAdminMode,
  selectedIds,
  onSelectToggle,
}: SortableShowcaseGridProps) {
  const [apps, setApps] = useState(initialApps);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = apps.findIndex((a) => a.id === active.id);
    const newIndex = apps.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(apps, oldIndex, newIndex);
    setApps(reordered);

    setSaveStatus('saving');
    try {
      const appOrder = reordered.map((app, i) => ({ appName: app.name, order: i + 1 }));
      const res = await fetch('/api/admin-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, appOrder }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setApps(initialApps);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div>
      {saveStatus !== 'idle' && (
        <div className={`text-xs font-medium mb-2 ${
          saveStatus === 'saving' ? 'text-amber-600' :
          saveStatus === 'saved' ? 'text-green-600' :
          'text-red-600'
        }`}>
          {saveStatus === 'saving' ? 'Saving order...' :
           saveStatus === 'saved' ? 'Order saved!' :
           'Failed to save order'}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={apps.map((a) => a.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <SortableCard
                key={app.id}
                app={app}
                starCount={starCounts[app.id] || 0}
                isStarred={starred.has(app.id)}
                onToggleStar={() => onToggleStar(app.id)}
                onClick={() => onAppClick(app)}
                searchQuery={searchQuery}
                isAdminMode={isAdminMode}
                isSelected={selectedIds.has(app.id)}
                onSelectToggle={() => onSelectToggle(app.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
