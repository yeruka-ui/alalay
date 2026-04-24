import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AppErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={fallbackStyles.container}>
          <Text style={fallbackStyles.heading}>Something went wrong</Text>
          <Text style={fallbackStyles.message}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={fallbackStyles.button}
          >
            <Text style={fallbackStyles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Expo-router named export — called when a route segment throws during render.
export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View style={fallbackStyles.container}>
      <Text style={fallbackStyles.heading}>Something went wrong</Text>
      <Text style={fallbackStyles.message}>{error.message}</Text>
      <TouchableOpacity onPress={retry} style={fallbackStyles.button}>
        <Text style={fallbackStyles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const fallbackStyles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
    backgroundColor: "#ffffff",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: "#B902D6",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
};
