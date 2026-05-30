import { useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { Button, Checkbox, ControlField, Skeleton, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import { useQueryOnboardingBackupPhrase } from '@/modules/onboarding/hooks/use-query-onboarding-backup-phrase';

const DEFAULT_PHRASE_WORD_COUNT = 12;

const getPhraseLayout = (wordCount: number) => {
  const columnCount = wordCount === 24 ? 3 : 2;
  const wordsPerColumn = columnCount === 3 ? 8 : Math.ceil(wordCount / 2);

  return { columnCount, wordsPerColumn };
};

const PhraseGridSkeleton = ({
  columnCount,
  wordsPerColumn,
}: {
  columnCount: number;
  wordsPerColumn: number;
}) => (
  <View className="flex-row justify-center gap-3">
    {Array.from({ length: columnCount }).map((_, columnIndex) => (
      <View className="flex-1" key={`phrase-skeleton-column-${columnIndex}`}>
        {Array.from({ length: wordsPerColumn }).map((_, rowIndex) => (
          <Skeleton
            className="my-1 h-5 w-full rounded-sm"
            key={`phrase-skeleton-row-${columnIndex}-${rowIndex}`}
          />
        ))}
      </View>
    ))}
  </View>
);

export default function BackupPhrase() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { copyToClipboard } = useClipboard();

  const [hasRevealed, setHasRevealed] = useState(false);
  const [hasSavedPhrase, setHasSavedPhrase] = useState(false);

  const { data: backupPhrase, isLoading } = useQueryOnboardingBackupPhrase();

  const words = useMemo(() => (backupPhrase ?? '').split(' ').filter(Boolean), [backupPhrase]);
  const phraseLayout = useMemo(
    () => getPhraseLayout(words.length || DEFAULT_PHRASE_WORD_COUNT),
    [words.length],
  );
  const { columnCount, wordsPerColumn } = phraseLayout;
  const columns = useMemo(() => {
    if (columnCount === 3) {
      return [words.slice(0, 8), words.slice(8, 16), words.slice(16, 24)];
    }

    const midpoint = Math.ceil(words.length / 2);
    return [words.slice(0, midpoint), words.slice(midpoint)];
  }, [columnCount, words]);

  const handleReveal = () => {
    if (hasRevealed) return;

    setHasRevealed(true);
  };

  const handleCopy = () => {
    if (!backupPhrase) return;

    void copyToClipboard(backupPhrase);
  };

  const handleNext = () => {
    router.push('/onboarding/confirm-phrase');
  };

  return (
    <Page isBrandVisible className="px-6 py-12" edges="all">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <Typography className="mb-10 text-center text-3xl font-semibold" type="h3">
            {t('defi:title.back.up.seed.phrase')}
          </Typography>

          <Typography className="text-muted mb-8" type="body">
            {t('defi:description.phraseBrowse.back.up.seed.phrase', {
              count: words.length || 12,
            })}
          </Typography>

          <View className="border-border bg-surface-secondary relative overflow-hidden rounded-xl border px-4 py-5">
            {isLoading ? (
              <PhraseGridSkeleton columnCount={columnCount} wordsPerColumn={wordsPerColumn} />
            ) : (
              <>
                {!hasRevealed ? (
                  <Pressable
                    accessibilityRole="button"
                    className="bg-surface-secondary absolute inset-0 z-10 items-center justify-center gap-2"
                    onPress={handleReveal}
                  >
                    <ThemedIcon name="eye-off-outline" size={24} className="text-muted" />
                    <Typography className="text-center" type="body">
                      {t('defi:notice.nobody.looking')}
                    </Typography>
                    <Typography className="text-muted mt-1 text-center" type="body">
                      {t('defi:notice.reveal.seed')}
                    </Typography>
                  </Pressable>
                ) : null}

                <View className="flex-row justify-center gap-3">
                  {columns.map((column, columnIndex) => {
                    const startIndex = columnIndex * wordsPerColumn;

                    return (
                      <View className="flex-1" key={`phrase-column-${columnIndex}`}>
                        {column.map((word, index) => (
                          <Typography
                            className="py-1 text-sm"
                            key={`${startIndex + index}-${word}`}
                            type="body"
                            weight="semibold"
                          >
                            <Typography
                              className="text-accent text-sm"
                              type="body"
                              weight="semibold"
                            >
                              {startIndex + index + 1}.
                            </Typography>{' '}
                            {word}
                          </Typography>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {hasRevealed ? (
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <Button onPress={() => setHasRevealed(false)} variant="ghost" size="sm">
                <ThemedIcon name="eye-off-outline" size={18} className="text-accent" />
                <Button.Label className="text-accent">
                  {t('defi:action.hide.seed.phrase')}
                </Button.Label>
              </Button>
              <Button onPress={handleCopy} variant="ghost" size="sm">
                <ThemedIcon name="copy-outline" size={18} className="text-accent" />
                <Button.Label className="text-accent">{t('global:action.copy')}</Button.Label>
              </Button>
            </View>
          ) : null}

          <ControlField
            isSelected={hasSavedPhrase}
            onSelectedChange={setHasSavedPhrase}
            className="mt-8 flex-row items-center gap-3"
          >
            <ControlField.Indicator>
              <Checkbox className="rounded-sm" />
            </ControlField.Indicator>
            <Typography className="shrink" type="body" weight="semibold">
              {t('defi:description.phraseBrowse.saved.seed')}
            </Typography>
          </ControlField>

          <View className="mt-10 items-center">
            <Button
              isDisabled={!hasRevealed || !hasSavedPhrase || !backupPhrase}
              onPress={handleNext}
              size="sm"
            >
              <Button.Label>{t('global:action.next')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
