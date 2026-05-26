import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  BackHandler,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTestById,
  submitTest,
  setAnswer,
  setCurrentQuestion,
  resetTest,
} from '../../store/slices/testSlice';
import { COLORS } from '../../constants/colors';

const TestScreen = ({ navigation, route }) => {
  const { testId } = route.params;
  const dispatch = useDispatch();
  const { selectedTest, answers, currentQuestion, isSubmitting } = useSelector(
    state => state.tests,
  );

  const [timeLeft, setTimeLeft] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTestById(testId));
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedTest) {
      setTimeLeft(selectedTest.duration * 60);
    }
  }, [selectedTest]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft > 0 && selectedTest]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert('Exit Test?', 'Your progress will be lost.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            onPress: () => {
              dispatch(resetTest());
              navigation.goBack();
            },
          },
        ]);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = optionIndex => {
    dispatch(
      setAnswer({
        questionIndex: currentQuestion,
        selectedOption: optionIndex,
      }),
    );
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      Alert.alert('Submit Test?', 'Are you sure you want to submit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => doSubmit() },
      ]);
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    clearInterval(timerRef.current);
    const answersArray = Object.entries(answers).map(
      ([questionIndex, selectedOption]) => ({
        questionIndex: Number(questionIndex),
        selectedOption,
      }),
    );

    const timeTaken = selectedTest.duration * 60 - timeLeft;
    const result = await dispatch(
      submitTest({ id: testId, data: { answers: answersArray, timeTaken } }),
    );

    if (submitTest.fulfilled.match(result)) {
      navigation.replace('TestResult', {
        result: result.payload,
        testId,
        attemptId: result.payload.attemptId,
      });
    }
  };

  if (!selectedTest) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading test...</Text>
      </View>
    );
  }

  const question = selectedTest?.questions?.[currentQuestion];
  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No questions available</Text>
      </View>
    );
  }
  const selectedOption = answers[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft < 300; // 5 minutes

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleSubmit(false)}>
          <Icon name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.questionCount}>
            {currentQuestion + 1}/{selectedTest.questions.length}
          </Text>
          <Text style={styles.testTitle} numberOfLines={1}>
            {selectedTest.title}
          </Text>
        </View>
        <View style={[styles.timer, isLowTime && styles.timerLow]}>
          <Icon
            name="clock-outline"
            size={16}
            color={isLowTime ? COLORS.error : COLORS.primary}
          />
          <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                ((currentQuestion + 1) / selectedTest.questions.length) * 100
              }%`,
            },
          ]}
        />
      </View>

      {/* Question */}
      <ScrollView
        style={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Q{currentQuestion + 1}.</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question?.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(index)}
              style={[
                styles.optionBtn,
                selectedOption === index && styles.optionSelected,
              ]}
            >
              <View
                style={[
                  styles.optionLabel,
                  selectedOption === index && styles.optionLabelSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabelText,
                    selectedOption === index && styles.optionLabelTextSelected,
                  ]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === index && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Marks info */}
        <View style={styles.marksInfo}>
          <Text style={styles.marksText}>✅ +{question.marks || 1} marks</Text>
          <Text style={styles.marksText}>
            ❌ -{question.negativeMarks || 0.25} marks
          </Text>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={() =>
            dispatch(setCurrentQuestion(Math.max(0, currentQuestion - 1)))
          }
          disabled={currentQuestion === 0}
          style={[
            styles.navBtn,
            currentQuestion === 0 && styles.navBtnDisabled,
          ]}
        >
          <Icon
            name="chevron-left"
            size={24}
            color={currentQuestion === 0 ? COLORS.textLight : COLORS.primary}
          />
          <Text
            style={[
              styles.navBtnText,
              currentQuestion === 0 && styles.navBtnTextDisabled,
            ]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPalette(true)}
          style={styles.paletteBtn}
        >
          <Text style={styles.paletteBtnText}>
            {answeredCount}/{selectedTest.questions.length}
          </Text>
          <Text style={styles.paletteBtnLabel}>Answered</Text>
        </TouchableOpacity>

        {currentQuestion < selectedTest.questions.length - 1 ? (
          <TouchableOpacity
            onPress={() => dispatch(setCurrentQuestion(currentQuestion + 1))}
            style={styles.navBtn}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Icon name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handleSubmit(false)}
            style={styles.submitBtn}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question Palette Modal */}
      <Modal visible={showPalette} transparent animationType="slide">
        <View style={styles.paletteModal}>
          <View style={styles.paletteContent}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.paletteLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.success },
                  ]}
                />
                <Text style={styles.legendText}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.border }]}
                />
                <Text style={styles.legendText}>Not Visited</Text>
              </View>
            </View>
            <View style={styles.paletteGrid}>
              {selectedTest.questions.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    dispatch(setCurrentQuestion(index));
                    setShowPalette(false);
                  }}
                  style={[
                    styles.paletteItem,
                    answers[index] !== undefined && styles.paletteItemAnswered,
                    currentQuestion === index && styles.paletteItemCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.paletteItemText,
                      (answers[index] !== undefined ||
                        currentQuestion === index) &&
                        styles.paletteItemTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => handleSubmit(false)}
              style={styles.paletteSubmitBtn}
            >
              <Text style={styles.paletteSubmitText}>Submit Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textSecondary, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  questionCount: { fontSize: 12, color: COLORS.textSecondary },
  testTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerLow: { backgroundColor: '#FFE5E3' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  timerTextLow: { color: COLORS.error },
  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  questionContainer: { flex: 1, padding: 16 },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: { fontSize: 16, color: COLORS.textPrimary, lineHeight: 24 },
  optionsContainer: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabelSelected: { backgroundColor: COLORS.primary },
  optionLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  optionLabelTextSelected: { color: COLORS.white },
  optionText: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  optionTextSelected: { color: COLORS.primary, fontWeight: '500' },
  marksInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  marksText: { fontSize: 13, color: COLORS.textSecondary },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  navBtnTextDisabled: { color: COLORS.textLight },
  paletteBtn: { alignItems: 'center' },
  paletteBtnText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  paletteBtnLabel: { fontSize: 11, color: COLORS.textSecondary },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  paletteModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paletteContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paletteTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  paletteLegend: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: COLORS.textSecondary },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  paletteItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteItemAnswered: { backgroundColor: COLORS.success },
  paletteItemCurrent: { backgroundColor: COLORS.primary },
  paletteItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  paletteItemTextActive: { color: COLORS.white },
  paletteSubmitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  paletteSubmitText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default TestScreen;
