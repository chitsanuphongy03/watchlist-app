import {
  Accent,
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface NumberPickerModalProps {
  visible: boolean;
  initialValue: number;
  title: string;
  subtitle: string;
  min?: number;
  max?: number;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export function NumberPickerModal({
  visible,
  initialValue,
  title,
  subtitle,
  min = 1,
  max = 365,
  onConfirm,
  onCancel,
}: NumberPickerModalProps) {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const data = useMemo(() => {
    const items: number[] = [];
    for (let i = min; i <= max; i++) {
      items.push(i);
    }
    return items;
  }, [min, max]);

  useEffect(() => {
    if (visible) {
      const index = Math.max(0, initialValue - min);
      setSelectedIndex(index);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialValue, min]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const offset = e.nativeEvent.contentOffset.y;
      const index = Math.round(offset / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      setSelectedIndex(clamped);
    },
    [data.length],
  );

  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const handleConfirm = () => {
    onConfirm(data[selectedIndex]);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.pickerWrapper}>
            <View style={styles.pickerContainer}>
              <View style={styles.selectionHighlight} pointerEvents="none" />
              <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.toString()}
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
            <Text style={styles.unit}>วัน</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>ตกลง</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.lg,
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    width: 100,
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
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
  },
  unit: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.medium,
    color: Colors.dark.text,
    marginLeft: Spacing.md,
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
