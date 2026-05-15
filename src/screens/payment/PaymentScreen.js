import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';

const PaymentScreen = ({ navigation, route }) => {
  const { course, batch } = route.params || {};
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const item = course || batch;
  const price = item?.discountPrice || item?.price || 0;
  const originalPrice = item?.price || 0;
  const discount = originalPrice - price;
  const discountPercent = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;

  const handlePayment = async () => {
    if (price === 0) {
      // Free enrollment
      try {
        setLoading(true);
        await api.post('/payments/verify', {
          razorpay_order_id: 'free',
          razorpay_payment_id: 'free',
          razorpay_signature: 'free',
          courseId: course?._id,
          batchId: batch?._id,
        });
        navigation.replace('PaymentSuccess', { item });
      } catch (err) {
        Alert.alert('Error', 'Enrollment failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const orderRes = await api.post('/payments/create-order', {
        courseId: course?._id,
        batchId: batch?._id,
        amount: price,
      });

      const { orderId, amount, currency, key } = orderRes.data.data;

      const options = {
        description: `Payment for ${item?.title || item?.name}`,
        image: 'https://your-logo-url.com/logo.png',
        currency,
        key,
        amount,
        name: 'Technosavvys',
        order_id: orderId,
        prefill: {
          email: user?.email,
          contact: user?.phone,
          name: user?.name,
        },
        theme: { color: COLORS.primary },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // Verify payment
      await api.post('/payments/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        courseId: course?._id,
        batchId: batch?._id,
      });

      navigation.replace('PaymentSuccess', { item });
    } catch (err) {
      if (err.code !== 2) { // 2 = user cancelled
        Alert.alert('Payment Failed', err.description || 'Payment could not be processed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Course/Batch Info */}
        <View style={styles.itemCard}>
          <Text style={styles.itemType}>{course ? '📚 Course' : '🎓 Batch'}</Text>
          <Text style={styles.itemTitle}>{item?.title || item?.name}</Text>
          <Text style={styles.itemMeta}>
            {item?.instructor?.name || ''} • {item?.language || 'Hindi'}
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Original Price</Text>
            <Text style={styles.priceValue}>₹{originalPrice}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount ({discountPercent}% off)</Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{price}</Text>
          </View>
          {discount > 0 && (
            <Text style={styles.savingText}>🎉 You save ₹{discount} on this purchase!</Text>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's Included</Text>
          {[
            { icon: 'video', text: 'Recorded Video Lectures' },
            { icon: 'video-wireless', text: 'Live Interactive Classes' },
            { icon: 'file-pdf-box', text: 'Study Notes & PDFs' },
            { icon: 'clipboard-text', text: 'Mock Tests & Quizzes' },
            { icon: 'chat-question', text: 'Doubt Support' },
            { icon: 'infinity', text: 'Lifetime Access' },
          ].map((feature, i) => (
            <View key={i} style={styles.featureItem}>
              <Icon name={feature.icon} size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>₹{price}</Text>
        </View>
        <TouchableOpacity onPress={handlePayment} disabled={loading} style={styles.payBtn}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.payBtnGradient}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name={price === 0 ? 'check' : 'lock'} size={20} color={COLORS.white} />
                <Text style={styles.payBtnText}>{price === 0 ? 'Enroll Free' : `Pay ₹${price}`}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  content: { flex: 1 },
  itemCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  itemType: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  itemTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  itemMeta: { fontSize: 13, color: COLORS.textSecondary },
  priceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 16,
  },
  priceTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 15, color: COLORS.textSecondary },
  priceValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  savingText: { fontSize: 13, color: COLORS.success, marginTop: 8, textAlign: 'center' },
  featuresCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 16,
  },
  featuresTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 15, color: COLORS.textPrimary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 16,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: 12, color: COLORS.textSecondary },
  footerPriceValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  payBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  payBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  payBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default PaymentScreen;
