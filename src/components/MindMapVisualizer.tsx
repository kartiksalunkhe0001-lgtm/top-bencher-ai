import React, { useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Code2,
  Lightbulb,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { MindMapNode } from '../types';

interface MindMapVisualizerProps {
  rootNode: MindMapNode | null;
}

export const MindMapVisualizer: React.FC<MindMapVisualizerProps> = ({ rootNode }) => {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(rootNode);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  if (!rootNode) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-950/80 border border-violet-800 flex items-center justify-center mx-auto text-violet-400">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Mind Map Generated</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload your notes or curriculum in Ingestion Engine, then choose "Hierarchical Mind Map" in Study Generator
          to visualize the conceptual branches and invariant dependencies.
        </p>
      </div>
    );
  }

  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderNode = (node: MindMapNode, depth: number = 0) => {
    const isCollapsed = collapsedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const matchesSearch =
      searchQuery &&
      (node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.detail.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div key={node.id} className="space-y-2">
        <div
          onClick={() => setSelectedNode(node)}
          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
            isSelected
              ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 text-white font-bold'
              : matchesSearch
              ? 'bg-amber-950/50 border-amber-500 text-amber-200'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleCollapse(node.id, e)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400"
              aria-label={isCollapsed ? 'Expand node' : 'Collapse node'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
          )}

          <div className="flex-1 truncate">
            <span className="font-semibold">{node.label}</span>
            {node.formula && (
              <span className="ml-2 font-mono text-[10px] text-indigo-400 opacity-90 hidden sm:inline">
                [{node.formula}]
              </span>
            )}
          </div>

          {hasChildren && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
              {node.children!.length} sub-branches
            </span>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="border-l border-slate-800/80 ml-4 pl-1 space-y-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>Interactive Mind Map & Concept Hierarchy</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Axiomatic Dependency Tree & Invariant Structure
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Explore how fundamental conservation laws branch into specialized mathematical derivations and applications.
          Click any node to inspect governing formulas, common pitfalls, and key exam takeaways.
        </p>

        {/* Search Bar */}
        <div className="mt-4 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search concepts, theorems, or formulas in mind map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Main Grid: Tree Explorer on Left, Node Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 max-h-[580px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span>Concept Hierarchy Branches</span>
            <span>Click node to inspect</span>
          </div>

          {renderNode(rootNode)}
        </div>

        {/* Right Column: Inspected Node Details */}
        <div className="lg:col-span-5 space-y-4">
          {(() => {
            const activeNode = selectedNode || rootNode;
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Concept Inspector
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    ACTIVE NODE
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">{activeNode.label}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeNode.detail}</p>
                </div>

                {activeNode.formula && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Governing Mathematical Invariant:</div>
                    <div className="font-mono text-xs text-indigo-300 font-semibold">{activeNode.formula}</div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/60 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-violet-300">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Top Bencher Key Takeaway:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{activeNode.keyTakeaway}</p>
                </div>

                {activeNode.children && activeNode.children.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-slate-400">Subordinate Branches ({activeNode.children.length}):</div>
                    <div className="space-y-1.5">
                      {activeNode.children.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => setSelectedNode(ch)}
                          className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium truncate">{ch.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
