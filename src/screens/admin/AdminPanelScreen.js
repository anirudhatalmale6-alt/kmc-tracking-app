import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Input, Card } from '../../components';
import { COLORS, SIZES } from '../../config/theme';
import { getAllBabies, addBaby, addParent, addStaff } from '../../config/database';
import { generatePIN, validateMobile } from '../../utils/helpers';

const AdminPanelScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('baby'); // 'baby', 'parent', 'staff'

  // Baby form
  const [babyName, setBabyName] = useState('');
  const [uhid, setUhid] = useState('');
  const [bedNo, setBedNo] = useState('');

  // Parent form
  const [motherName, setMotherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [generatedPIN, setGeneratedPIN] = useState('');

  // Staff form
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBabies();
  }, []);

  const loadBabies = async () => {
    try {
      const babiesData = await getAllBabies();
      setBabies(babiesData);
    } catch (error) {
      console.error('Error loading babies:', error);
    }
  };

  const handleAddBaby = async () => {
    const newErrors = {};
    if (!babyName.trim()) newErrors.babyName = 'Baby name is required';
    if (!uhid.trim()) newErrors.uhid = 'UHID is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await addBaby(babyName.trim(), uhid.trim(), bedNo.trim());
      Alert.alert('Success', 'Baby added successfully!');
      setBabyName('');
      setUhid('');
      setBedNo('');
      setErrors({});
      loadBabies();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add baby. Please try again.');
      console.error('Error adding baby:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = async () => {
    const newErrors = {};
    if (!motherName.trim()) newErrors.motherName = 'Mother name is required';
    if (!mobile) newErrors.mobile = 'Mobile number is required';
    else if (!validateMobile(mobile)) newErrors.mobile = 'Invalid mobile number';
    if (!selectedBabyId) newErrors.selectedBabyId = 'Please select a baby';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const pin = generatePIN();
      await addParent(motherName.trim(), mobile, pin, selectedBabyId);

      setGeneratedPIN(pin);
      Alert.alert(
        'Parent Added Successfully',
        `Mobile: ${mobile}\nPIN: ${pin}\n\nPlease share these credentials with the parent.`,
        [{ text: 'OK' }]
      );

      setMotherName('');
      setMobile('');
      setSelectedBabyId('');
      setErrors({});
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add parent. Please try again.');
      console.error('Error adding parent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    const newErrors = {};
    if (!staffName.trim()) newErrors.staffName = 'Name is required';
    if (!staffUsername.trim()) newErrors.staffUsername = 'Username is required';
    if (!staffPassword || staffPassword.length < 4) {
      newErrors.staffPassword = 'Password must be at least 4 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await addStaff(staffName.trim(), staffUsername.trim(), staffPassword, isAdmin);

      Alert.alert('Success', 'Staff member added successfully!');
      setStaffName('');
      setStaffUsername('');
      setStaffPassword('');
      setIsAdmin(false);
      setErrors({});
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add staff. Please try again.');
      console.error('Error adding staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.tabActive]}
      onPress={() => {
        setActiveTab(value);
        setErrors({});
      }}
    >
      <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton title="Add Baby" value="baby" />
        <TabButton title="Add Parent" value="parent" />
        <TabButton title="Add Staff" value="staff" />
      </View>

      <ScrollView style={styles.content}>
        {/* Add Baby Form */}
        {activeTab === 'baby' && (
          <Card>
            <Text style={styles.formTitle}>Register New Baby</Text>

            <Input
              label="Baby Name"
              value={babyName}
              onChangeText={(text) => {
                setBabyName(text);
                setErrors({ ...errors, babyName: null });
              }}
              placeholder="Enter baby's name"
              error={errors.babyName}
            />

            <Input
              label="UHID"
              value={uhid}
              onChangeText={(text) => {
                setUhid(text);
                setErrors({ ...errors, uhid: null });
              }}
              placeholder="Enter UHID"
              error={errors.uhid}
            />

            <Input
              label="Bed Number"
              value={bedNo}
              onChangeText={setBedNo}
              placeholder="Enter bed number (optional)"
            />

            <Button
              title="Add Baby"
              onPress={handleAddBaby}
              loading={loading}
              style={styles.submitButton}
            />
          </Card>
        )}

        {/* Add Parent Form */}
        {activeTab === 'parent' && (
          <Card>
            <Text style={styles.formTitle}>Create Parent Account</Text>

            <Input
              label="Mother's Name"
              value={motherName}
              onChangeText={(text) => {
                setMotherName(text);
                setErrors({ ...errors, motherName: null });
              }}
              placeholder="Enter mother's name"
              error={errors.motherName}
            />

            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text.replace(/[^0-9]/g, ''));
                setErrors({ ...errors, mobile: null });
              }}
              placeholder="Enter 10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.mobile}
            />

            <Text style={styles.inputLabel}>Select Baby</Text>
            <View style={styles.babySelector}>
              {babies.length > 0 ? (
                babies.map((baby) => (
                  <TouchableOpacity
                    key={baby.id}
                    style={[
                      styles.babyOption,
                      selectedBabyId === baby.id && styles.babyOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedBabyId(baby.id);
                      setErrors({ ...errors, selectedBabyId: null });
                    }}
                  >
                    <Text
                      style={[
                        styles.babyOptionText,
                        selectedBabyId === baby.id && styles.babyOptionTextSelected,
                      ]}
                    >
                      {baby.name} ({baby.uhid})
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noBabies}>No babies registered yet</Text>
              )}
            </View>
            {errors.selectedBabyId && (
              <Text style={styles.errorText}>{errors.selectedBabyId}</Text>
            )}

            <Button
              title="Create Parent Account"
              onPress={handleAddParent}
              loading={loading}
              style={styles.submitButton}
              disabled={babies.length === 0}
            />

            {generatedPIN && (
              <View style={styles.pinDisplay}>
                <Text style={styles.pinLabel}>Generated PIN:</Text>
                <Text style={styles.pinValue}>{generatedPIN}</Text>
                <Text style={styles.pinNote}>
                  Share this PIN with the parent securely
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Add Staff Form */}
        {activeTab === 'staff' && (
          <Card>
            <Text style={styles.formTitle}>Add Staff Member</Text>

            <Input
              label="Full Name"
              value={staffName}
              onChangeText={(text) => {
                setStaffName(text);
                setErrors({ ...errors, staffName: null });
              }}
              placeholder="Enter full name"
              error={errors.staffName}
            />

            <Input
              label="Username"
              value={staffUsername}
              onChangeText={(text) => {
                setStaffUsername(text);
                setErrors({ ...errors, staffUsername: null });
              }}
              placeholder="Enter username"
              error={errors.staffUsername}
            />

            <Input
              label="Password"
              value={staffPassword}
              onChangeText={(text) => {
                setStaffPassword(text);
                setErrors({ ...errors, staffPassword: null });
              }}
              placeholder="Enter password"
              secureTextEntry
              error={errors.staffPassword}
            />

            <TouchableOpacity
              style={styles.adminToggle}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                {isAdmin && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.adminLabel}>Grant Admin Access</Text>
            </TouchableOpacity>

            <Button
              title="Add Staff Member"
              onPress={handleAddStaff}
              loading={loading}
              style={styles.submitButton}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  backText: {
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  formTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  babySelector: {
    marginBottom: 16,
  },
  babyOption: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  babyOptionSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  babyOptionText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  babyOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  noBabies: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: -12,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  pinDisplay: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  pinValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  pinNote: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 8,
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  adminLabel: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
});

export default AdminPanelScreen;
