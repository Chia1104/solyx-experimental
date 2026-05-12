import { useMemo, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Text, cn } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { useUserStore } from '@/modules/user/stores/user';

interface ConfirmPhraseFormValues {
  answers: Record<string, number>;
}

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : (value ?? '');

const getQuestionIndexes = (wordCount: number) => {
  if (wordCount <= 0) return [];

  return Array.from(new Set([0, Math.floor(wordCount / 2), wordCount - 1]));
};

const getOptionIndexes = (answerIndex: number, wordCount: number, questionIndex: number) => {
  const indexes = new Set([answerIndex]);
  let offset = questionIndex + 2;

  while (indexes.size < Math.min(3, wordCount)) {
    indexes.add((answerIndex + offset) % wordCount);
    offset += 3;
  }

  return [...indexes].sort((a, b) => a - b);
};

export default function ConfirmPhrase() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const params = useLocalSearchParams<{ phrase?: string }>();
  const phrase = getParamValue(params.phrase);
  const setBackupPhraseState = useUserStore(state => state.setBackupPhraseState);

  const [isWrong, setIsWrong] = useState(false);
  const words = useMemo(() => phrase.split(' ').filter(Boolean), [phrase]);
  const questions = useMemo(
    () =>
      getQuestionIndexes(words.length).map((answerIndex, questionIndex) => ({
        answerIndex,
        options: getOptionIndexes(answerIndex, words.length, questionIndex),
      })),
    [words.length],
  );

  const form = useForm<ConfirmPhraseFormValues>({
    defaultValues: {
      answers: {},
    },
    mode: 'onChange',
  });
  const answers = form.watch('answers');

  const handleSelect = (questionIndex: number, answerIndex: number) => {
    form.setValue(`answers.${questionIndex}`, answerIndex, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setIsWrong(false);
  };

  const handleConfirm = form.handleSubmit(values => {
    const isCorrect = questions.every(
      (question, index) => values.answers[index] === question.answerIndex,
    );

    if (!isCorrect) {
      setIsWrong(true);
      return;
    }

    setBackupPhraseState('done');
    router.replace('/onboarding/done');
  });

  return (
    <Page isBrandVisible className="px-6 py-12">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <Text className="mb-12 text-center text-3xl font-semibold" type="h3">
            {t('defi:title.seed.phrase.confirm')}
          </Text>

          <View className="gap-8">
            {questions.map((question, questionIndex) => (
              <View key={`question-${question.answerIndex}`}>
                <Text className="mb-3" type="body" weight="semibold">
                  {t('defi:label.phraseConfirm.seed.phrase', {
                    index: question.answerIndex + 1,
                  })}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {question.options.map(optionIndex => {
                    const isSelected = answers[questionIndex] === optionIndex;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        className={cn(
                          'border-border rounded-lg border px-4 py-2',
                          isSelected && 'border-accent bg-accent',
                        )}
                        key={`${question.answerIndex}-${optionIndex}`}
                        onPress={() => handleSelect(questionIndex, optionIndex)}
                      >
                        <Text
                          className={cn('text-muted', isSelected && 'text-accent-foreground')}
                          type="body"
                        >
                          {words[optionIndex]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View className="mt-10 items-center">
            {isWrong ? (
              <Text className="text-danger mb-4 text-center" type="body">
                {t('defi:error.seed.phrase.wrong.answers')}
              </Text>
            ) : null}

            <Button
              isDisabled={Object.keys(answers).length < questions.length}
              onPress={handleConfirm}
            >
              <Button.Label>{t('global:action.confirm')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
