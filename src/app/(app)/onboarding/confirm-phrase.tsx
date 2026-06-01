import { useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import {
  queryOnboardingBackupPhraseOptions,
  useQueryOnboardingBackupPhrase,
} from '@/modules/onboarding/hooks/use-query-onboarding-backup-phrase';
import { buildConfirmPhraseQuestions } from '@/modules/onboarding/utils/confirm-phrase-questions';
import type { ConfirmPhraseQuestion } from '@/modules/onboarding/utils/confirm-phrase-questions';
import { useUserStore } from '@/modules/user/stores/user';

interface ConfirmPhraseFormValues {
  answers: Record<string, number>;
}

export default function ConfirmPhrase() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const setBackupPhraseState = useUserStore(state => state.setBackupPhraseState);

  const { data: backupPhrase, isLoading } = useQueryOnboardingBackupPhrase();
  const [isWrong, setIsWrong] = useState(false);

  const words = useMemo(() => (backupPhrase ?? '').split(' ').filter(Boolean), [backupPhrase]);
  const questionsRef = useRef<ConfirmPhraseQuestion[] | null>(null);
  const questions = useMemo(() => {
    if (words.length === 0) return [];

    questionsRef.current ??= buildConfirmPhraseQuestions(words.length);

    return questionsRef.current;
  }, [words.length]);

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
    queryClient.removeQueries(queryOnboardingBackupPhraseOptions(null));
    router.replace('/onboarding/done');
  });

  if (isLoading || !backupPhrase) {
    return null;
  }

  return (
    <Page isBrandVisible className="px-6 py-12" edges="all">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <Typography className="mb-12 text-center text-3xl font-semibold" type="h3">
            {t('defi:title.seed.phrase.confirm')}
          </Typography>

          <View className="gap-8">
            {questions.map((question, questionIndex) => (
              <View key={`question-${question.answerIndex}`}>
                <Typography className="mb-3" type="body" weight="semibold">
                  {t('defi:label.phraseConfirm.seed.phrase', {
                    index: question.answerIndex + 1,
                  })}
                </Typography>

                <View className="flex-row flex-wrap gap-2">
                  {question.options.map(optionIndex => {
                    const isSelected = answers[questionIndex] === optionIndex;
                    return (
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => handleSelect(questionIndex, optionIndex)}
                        key={`${question.answerIndex}-${optionIndex}`}
                      >
                        <Button.Label>{words[optionIndex]}</Button.Label>
                      </Button>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View className="mt-10 items-center">
            {isWrong ? (
              <Typography className="text-danger mb-4 text-center" type="body">
                {t('defi:error.seed.phrase.wrong.answers')}
              </Typography>
            ) : null}

            <Button
              isDisabled={Object.keys(answers).length < questions.length}
              onPress={handleConfirm}
              size="sm"
            >
              <Button.Label>{t('global:action.confirm')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
