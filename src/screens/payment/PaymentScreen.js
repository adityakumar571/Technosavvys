import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../../store/slices/authSlice';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';

const F = { urbanist: 'Urbanist-Medium' };

const PaymentScreen = ({ navigation, route }) => {
  const { course, batch } = route.params || {};
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const item = course || batch;
  const isCourse = !!course;
  const price = item?.discountPrice > 0 ? item.discountPrice : (item?.price || 0);
  const originalPrice = item?.price || 0;
  const discount = originalPrice > price ? originalPrice - price : 0;
  const discountPercent = originalPrice > 0 && discount > 0
    ? Math.round((discount / originalPrice) * 100) : 0;
  const isFree = item?.isFree || price === 0;

  // ── Free Enrollment ──────────────────────────────────────────────────────────
  const handleFreeEnroll = async () => {
    setLoading(true);
    try {
      await api.post('/payments/enroll-free', {
        courseId: course?._id || undefined,
        batchId: batch?._id || undefined,
      });
      // Refresh user data so enrolledCourses/Batches updates
      await dispatch(fetchMe());
      navigation.replace('PaymentSuccess', { item, isFree: true });
    } catch (err) {
      Alert.alert('Enrollment Failed', err.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  // ── Paid Enrollment (Razorpay) ───────────────────────────────────────────────
  const handlePaidEnroll = async () => {
    setLoading(true);
    try {
      // Step 1: Create order
      const orderRes = await api.post('/payments/create-order', {
        courseId: course?._id || undefined,
        batchId: batch?._id || undefined,
        amount: price,
      });
      const { orderId, amount, currency, key } = orderRes.data.data;

      // Step 2: Open Razorpay
      // react-native-razorpay is installed but disabled for New Architecture
      // Using WebView-based approach as fallback
      Alert.alert(
        'Payment Gateway',
        `Amount: ₹${price}\nOrder ID: ${orderId}\n\nRazorpay integration requires New Architecture support.\n\nFor testing, use the test mode.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: 'Simulate Success (Test)',
            onPress: async () => {
              try {
                // In production this comes from Razorpay SDK
                // For testing: call verify with test data
                await api.post('/payments/verify', {
                  razorpay_order_id: orderId,
                  razorpay_payment_id: `pay_test_${Date.now()}`,
                  razorpay_signature: generateTestSignature(orderId, key),
                  courseId: course?._id || undefined,
                  batchId: batch?._id || undefined,
                });
                await dispatch(fetchMe());
                navigation.replace('PaymentSuccess', { item, isFree: false });
              } catch (e) {
                Alert.alert('Error', e.response?.data?.message || 'Payment failed');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not create order');
      setLoading(false);
    }
  };

  // Dummy signature for test mode only — never use in production
  const generateTestSignature = (orderId, key) => {
    return `test_sig_${orderId}`;
  };

  const handlePayment = () => {
    if (isFree) {
      handleFreeEnroll();
    } else {
      handlePaidEnroll();
    }
  };

  const features = [
    { icon: 'video', text: 'Recorded Video Lectures' },
    { icon: 'video-wireless', text: 'Live Interactive Classes' },
    { icon: 'file-pdf-box', text: 'Study Notes & PDFs' },
    { icon: 'clipboard-text', text: 'Mock Tests & Quizzes' },
    { icon: 'chat-question', text: 'Doubt Support' },
    { icon: 'infinity', text: 'Lifetime Access' },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient colors={GRADIENTS.primary} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Order Summary</Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Item Info */}
        <View style={s.itemCard}>
          <View style={s.itemTypeRow}>
            <Text style={s.itemTypeIcon}>{isCourse ? '📚' : '🎓'}</Text>
            <Text style={s.itemTypeLabel}>{isCourse ? 'Course' : 'Batch'}</Text>
            {isFree && <View style={s.freeBadge}><Text style={s.freeBadgeText}>FREE</Text></View>}
          </View>
          <Text style={s.itemTitle}>{item?.title || item?.name}</Text>
          <Text style={s.itemMeta}>
            {item?.instructor?.name ? `by ${item.instructor.name}` : ''}
            {item?.language ? ` · ${item.language}` : ''}
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={s.priceCard}>
          <Text style={s.priceTitle}>Price Details</Text>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Original Price</Text>
            <Text style={s.priceValue}>{originalPrice === 0 ? 'Free' : `₹${originalPrice}`}</Text>
          </View>
          {discount > 0 && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Discount ({discountPercent}% off)</Text>
              <Text style={[s.priceValue, { color: COLORS.success }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={s.divider} />
          <View style={s.priceRow}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={[s.totalValue, isFree && { color: COLORS.success }]}>
              {isFree ? 'FREE' : `₹${price}`}
            </Text>
          </View>
          {discount > 0 && (
            <View style={s.savingRow}>
              <Icon name="tag" size={14} color={COLORS.success} />
              <Text style={s.savingText}>You save ₹{discount} on this purchase!</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={s.featuresCard}>
          <Text style={s.featuresTitle}>What's Included</Text>
          {features.map((f, i) => (
            <View key={i} style={s.featureItem}>
              <View style={s.featureIconBox}>
                <Icon name={f.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerLeft}>
          <Text style={s.footerLabel}>Total</Text>
          <Text style={[s.footerPrice, isFree && { color: COLORS.success }]}>
            {isFree ? 'FREE' : `₹${price}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          style={s.payBtn}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isFree ? [COLORS.success, '#2E7D32'] : GRADIENTS.primary}
            style={s.payBtnGrad}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name={isFree ? 'check-circle' : 'lock-open'} size={20} color={COLORS.white} />
                <Text style={s.payBtnText}>
                  {isFree ? 'Enroll Free' : `Pay ₹${price}`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.white, textAlign: 'center', fontFamily: F.urbanist },
  content: { flex: 1 },

  itemCard: { backgroundColor: COLORS.white, margin: 16, borderRadius: 16, padding: 20, elevation: 2 },
  itemTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  itemTypeIcon: { fontSize: 20 },
  itemTypeLabel: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist },
  freeBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  freeBadgeText: { fontSize: 12, color: COLORS.success, fontWeight: '700', fontFamily: F.urbanist },
  itemTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, fontFamily: F.urbanist },
  itemMeta: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist },

  priceCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, padding: 20, elevation: 2, marginBottom: 16 },
  priceTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, fontFamily: F.urbanist },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: COLORS.textSecondary, fontFamily: F.urbanist },
  priceValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', fontFamily: F.urbanist },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.primary, fontFamily: F.urbanist },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  savingText: { fontSize: 13, color: COLORS.success, fontFamily: F.urbanist },

  featuresCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, padding: 20, elevation: 2, marginBottom: 24 },
  featuresTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, fontFamily: F.urbanist },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 14, color: COLORS.textPrimary, fontFamily: F.urbanist },

  footer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 16 },
  footerLeft: { flex: 1 },
  footerLabel: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },
  footerPrice: { fontSize: 22, fontWeight: '700', color: COLORS.primary, fontFamily: F.urbanist },
  payBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  payBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  payBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700', fontFamily: F.urbanist },
});

export default PaymentScreen;
