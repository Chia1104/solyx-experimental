import { useMemo, useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Checkbox } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import Brand from '@/components/brand';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedText } from '@/components/ui/themed-text';

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : (value ?? '');

export default function BackupPhrase() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const params = useLocalSearchParams<{ phrase?: string }>();
  const phrase = getParamValue(params.phrase);

  const [hasRevealed, setHasRevealed] = useState(false);
  const [hasSavedPhrase, setHasSavedPhrase] = useState(false);

  const words = useMemo(() => phrase.split(' ').filter(Boolean), [phrase]);
  const columnCount = words.length === 24 ? 3 : 2;
  const columns = useMemo(() => {
    if (columnCount === 3) {
      return [words.slice(0, 8), words.slice(8, 16), words.slice(16, 24)];
    }

    const midpoint = Math.ceil(words.length / 2);
    return [words.slice(0, midpoint), words.slice(midpoint)];
  }, [columnCount, words]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(phrase);
  };

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/confirm-phrase',
      params: {
        phrase,
      },
    });
  };

  return (
    <Brand display={['background']} wrapperProps={{ className: 'flex-1 px-6 py-12' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <ThemedText className="mb-10 text-center text-3xl font-semibold" variant="headlineMedium">
            {t('defi:title.back.up.seed.phrase')}
          </ThemedText>

          <ThemedText className="text-muted mb-8" variant="bodyLarge">
            {t('defi:description.phraseBrowse.back.up.seed.phrase', {
              count: words.length || 12,
            })}
          </ThemedText>

          <View className="border-border bg-surface-secondary relative overflow-hidden rounded-xl border px-4 py-5">
            {!hasRevealed ? (
              <Pressable
                accessibilityRole="button"
                className="bg-surface-secondary absolute inset-0 z-10 items-center justify-center gap-2"
                onPress={() => setHasRevealed(true)}
              >
                <ThemedIcon name="eye-off-outline" size={24} className="text-muted" />
                <ThemedText className="text-center" variant="bodyLarge">
                  {t('defi:notice.nobody.looking')}
                </ThemedText>
                <ThemedText className="text-muted mt-1 text-center" variant="bodyLarge">
                  {t('defi:notice.reveal.seed')}
                </ThemedText>
              </Pressable>
            ) : null}

            <View className="flex-row justify-center gap-3">
              {columns.map((column, columnIndex) => {
                const wordsPerColumn =
                  columnCount === 3 ? 8 : Math.ceil(Math.max(words.length, 1) / 2);
                const startIndex = columnIndex * wordsPerColumn;

                return (
                  <View className="flex-1" key={`phrase-column-${columnIndex}`}>
                    {column.map((word, index) => (
                      <ThemedText
                        className="py-1 text-sm"
                        key={`${startIndex + index}-${word}`}
                        variant="titleMedium"
                      >
                        <ThemedText className="text-accent text-sm" variant="titleMedium">
                          {startIndex + index + 1}.
                        </ThemedText>{' '}
                        {word}
                      </ThemedText>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>

          {hasRevealed ? (
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <Button onPress={() => setHasRevealed(false)} variant="ghost" size="sm">
                <ThemedIcon name="eye-off-outline" size={18} className="text-accent" />
                <Button.Label className="text-accent">
                  {t('defi:action.hide.seed.phrase')}
                </Button.Label>
              </Button>
              <Button onPress={() => void handleCopy()} variant="ghost" size="sm">
                <ThemedIcon name="copy-outline" size={18} className="text-accent" />
                <Button.Label className="text-accent">{t('global:action.copy')}</Button.Label>
              </Button>
            </View>
          ) : null}

          <View className="mt-8 flex-row items-center gap-3">
            <Checkbox
              isSelected={hasSavedPhrase}
              onSelectedChange={setHasSavedPhrase}
              className="rounded-sm"
            />
            <ThemedText className="shrink" variant="titleMedium">
              {t('defi:description.phraseBrowse.saved.seed')}
            </ThemedText>
          </View>

          <View className="mt-10 items-center">
            <Button isDisabled={!hasRevealed || !hasSavedPhrase} onPress={handleNext}>
              <Button.Label>{t('global:action.next')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Brand>
  );
}
