import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  finder: {
    position: 'absolute',
    zIndex: 1,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeftEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topRightEdge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomLeftEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bottomRightEdge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  maskOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  maskInner: {
    backgroundColor: 'transparent',
  },
  maskRow: {
    width: '100%',
    paddingVertical: 12,
  },
  maskCenter: {
    display: 'flex',
    flexDirection: 'row',
  },
  animatedLine: {
    position: 'absolute',
    elevation: 4,
    zIndex: 0,
  },
});

export interface LayoutRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* taken from react-native types */
export interface LayoutChangeEvent {
  nativeEvent: {
    target: number;
    layout: LayoutRectangle;
  };
}

export interface Props {
  width?: number;
  height?: number;
  edgeWidth?: number;
  edgeColor?: string;
  edgeBorderWidth?: number;
  backgroundColor?: string;
  outerMaskOpacity?: number;
  showAnimatedLine?: boolean;
  animatedLineColor?: string;
  animatedLineHeight?: number;
  animatedLineWidth?: number;
  lineAnimationDuration?: number;
  animatedLineOrientation?: string;
  useNativeDriver?: boolean;
  onLayoutMeasured?: (event: LayoutChangeEvent) => void;
}

const edgeBorderStyle = {
  topRight: {
    // borderRightWidth: edgeBorderWidth,
    // borderTopWidth: edgeBorderWidth,
    // borderTopRightRadius: edgeRadius,
    transform: [{ rotate: '90deg' }],
  },
  topLeft: {
    // borderLeftWidth: edgeBorderWidth,
    // borderTopWidth: edgeBorderWidth,
    // borderTopLeftRadius: edgeRadius,
  },
  bottomRight: {
    // borderRightWidth: edgeBorderWidth,
    // borderBottomWidth: edgeBorderWidth,
    // borderBottomRightRadius: edgeRadius,
    transform: [{ rotate: '180deg' }],
  },
  bottomLeft: {
    // borderLeftWidth: edgeBorderWidth,
    // borderBottomWidth: edgeBorderWidth,
    // borderBottomLeftRadius: edgeRadius,
    transform: [{ rotate: '270deg' }],
  },
};

export const ScannerMask = (props: Props) => {
  const {
    width = 200,
    height = 200,
    edgeWidth = 20,
    edgeColor = '#fff',
    edgeBorderWidth = 4,
    backgroundColor = 'transparent',
    outerMaskOpacity = 0.6,
  } = props;

  function applyMaskFrameStyle() {
    return { backgroundColor, opacity: outerMaskOpacity, flex: 1 };
  }

  function renderEdge(edgePosition: keyof typeof edgeBorderStyle) {
    const defaultStyle = {
      width: edgeWidth,
      height: edgeWidth,
      borderColor: edgeColor,
    };

    return (
      <View style={[defaultStyle, styles[`${edgePosition}Edge`], edgeBorderStyle[edgePosition]]}>
        <Svg width={edgeWidth} height={edgeWidth} fill="none" {...props}>
          <Path
            stroke={'#FFB778'}
            strokeLinecap="round"
            strokeWidth={edgeBorderWidth}
            d={`M${edgeWidth + edgeBorderWidth} ${edgeBorderWidth / 2} H${
              edgeBorderWidth + 3
            } a6 6 0 0 0-6 6 v${edgeWidth}`}
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.maskOuter}>
        <View style={[styles.maskRow, applyMaskFrameStyle()]} />
        <View style={[{ height }, styles.maskCenter]}>
          <View style={[applyMaskFrameStyle()]} />
          <View style={[styles.maskInner, { width, height }]} />
          <View style={[applyMaskFrameStyle()]} />
        </View>
        <View style={[styles.maskRow, applyMaskFrameStyle()]} />
      </View>
      <View
        style={[
          styles.finder,
          { width: width + edgeBorderWidth, height: height + edgeBorderWidth },
        ]}
      >
        {renderEdge('topLeft')}
        {renderEdge('topRight')}
        {renderEdge('bottomLeft')}
        {renderEdge('bottomRight')}
      </View>
    </View>
  );
};
