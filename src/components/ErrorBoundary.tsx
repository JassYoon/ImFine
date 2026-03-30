import React, { Component } from 'react';

export class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
          <div className="max-w-md w-full bg-red-50 p-8 rounded-[40px] border border-red-100 space-y-4">
            <h2 className="text-xl font-black text-red-600">문제가 발생했습니다</h2>
            <p className="text-sm text-red-500 font-medium leading-relaxed">
              {this.state.errorInfo}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
