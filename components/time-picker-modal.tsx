import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Radius,
    Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function generateItems(count: number): string[] {
  return Array.from({ length: count }, (_, i) => i.toString().padStart(2, "0"));
}

const HOURS = generateItems(24);
const MINUTES = generateItems(60);

interface ScrollPickerProps {
  data: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function ScrollPicker({ data, selectedIndex, onSelect }: ScrollPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (flatListRef.current && !isScrolling.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [selectedIndex]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const offset = e.nativeEvent.contentOffset.y;
      const index = Math.round(offset / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      onSelect(clamped);
    },
    [data.length, onSelect],
  );

  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const isSelected = index === selectedIndex;
      return (
        <View
          style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
        >
          <Text
            style={[
              styles.pickerItemText,
              isSelected && styles.pickerItemTextSelected,
            ]}
          >
            {item}
          </Text>
        </View>
      );
    },
    [selectedIndex],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.pickerContainer}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        style={{ height: PICKER_HEIGHT }}
      />
    </View>
  );
}

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

export function TimePickerModal({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
  const [hourIndex, setHourIndex] = useState(0);
  const [minuteIndex, setMinuteIndex] = useState(0);

  useEffect(() => {
    if (visible && initialTime) {
      const [h, m] = initialTime.split(":");
      setHourIndex(parseInt(h, 10) || 0);
      setMinuteIndex(parseInt(m, 10) || 0);
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const h = HOURS[hourIndex];
    const m = MINUTES[minuteIndex];
    onConfirm(`${h}:${m}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>ตั้งเวลาเตือน</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.columnWrapper}>
              <Text style={styles.label}>ชั่วโมง</Text>
              <ScrollPicker
                data={HOURS}
                selectedIndex={hourIndex}
                onSelect={setHourIndex}
              />
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.columnWrapper}>
              <Text style={styles.label}>นาที</Text>
              <ScrollPicker
                data={MINUTES}
                selectedIndex={minuteIndex}
                onSelect={setMinuteIndex}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>ตกลง</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  columnWrapper: {
    alignItems: "center",
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.xs,
  },
  separator: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    width: 80,
    overflow: "hidden",
    borderRadius: Radius.md,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    position: "relative",
  },
  selectionHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: Accent.primary + "20",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Accent.primary + "60",
    zIndex: 1,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemSelected: {},
  pickerItemText: {
    fontSize: 22,
    fontFamily: FontFamily.medium,
    color: Colors.dark.textMuted,
  },
  pickerItemTextSelected: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
  },
  confirmButton: {
    backgroundColor: Accent.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
});
