import { useMemo } from 'react';
import { ActionBar, Button, ScreenHeader } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import { ROOM_TYPES } from '../../lib/models/constants.js';
import { roomImage, PALETTE_KEYS } from '../../lib/ai/mockImages.js';
import { t } from '../../i18n/index.js';

/** البند ٧ — اختيار بصري ببطاقات كبيرة، لا قائمة نصية */
export default function RoomTypeStep({ project, update, onNext }) {
  const covers = useMemo(
    () =>
      Object.fromEntries(
        ROOM_TYPES.map((type, i) => [
          type,
          roomImage({
            seed: `type_${type}`,
            palette: PALETTE_KEYS[i % PALETTE_KEYS.length],
            luxury: 0.4 + (i % 3) * 0.2,
            roomType: type,
          }),
        ]),
      ),
    [],
  );

  const select = (roomType) =>
    update({
      roomType,
      projectName: project.projectName || t(`roomType.${roomType}`),
    });

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('roomType.title')} subtitle={t('roomType.subtitle')} />

        <div className="grid-2">
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              className="pick"
              data-selected={project.roomType === type}
              onClick={() => select(type)}
            >
              <img src={covers[type]} className="pick__media" alt="" />
              <span className="pick__label">{t(`roomType.${type}`)}</span>
              {project.roomType === type && (
                <span className="pick__check">
                  <Icon name="check" size={15} strokeWidth={2.6} />
                </span>
              )}
            </button>
          ))}
        </div>

        {project.roomType && (
          <div className="mt-6">
            <label className="label" htmlFor="project-name">
              {t('roomType.nameLabel')}
            </label>
            <input
              id="project-name"
              className="field"
              value={project.projectName}
              placeholder={t('roomType.namePlaceholder')}
              onChange={(e) => update({ projectName: e.target.value })}
            />
          </div>
        )}
      </div>

      <ActionBar>
        <Button block disabled={!project.roomType} onClick={onNext}>
          {t('common.next')}
        </Button>
      </ActionBar>
    </>
  );
}
