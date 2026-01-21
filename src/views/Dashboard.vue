<template>
  <div class="p-4 md:p-8 space-y-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-center bg-gray-900 border-b-4 border-gray-700 p-4">
      <div class="flex items-center gap-4">
        <div class="text-4xl">🏰</div>
        <div>
          <h1 class="text-3xl font-bold text-neon-green">STRATEGY COMMAND CENTER</h1>
          <p class="text-sm text-gray-400">Current Quest Status: ACTIVE</p>
        </div>
      </div>
      <button @click="openWizard" class="mt-4 md:mt-0 pixel-btn pixel-btn-primary text-xl flex items-center gap-2">
        <span>⚔️</span> 擬定新策略 (NEW MISSION)
      </button>
    </header>

    <!-- Table Container -->
    <div class="overflow-x-auto pixel-border bg-black bg-opacity-50 p-2">
      <table class="w-full text-left border-collapse hidden md:table">
        <thead>
          <tr class="text-neon-pink border-b-2 border-dashed border-gray-600 text-sm">
            <th class="p-3 text-center">代號</th>
            <th class="p-3 text-left">名稱</th>
            <th class="p-3 text-center">持倉</th>
            <th class="p-3 text-right">成本</th>
            <th class="p-3 text-right">現價</th>
            <th class="p-3 text-right">報酬率</th>
            <th class="p-3 text-center">策略</th>
            <th class="p-3 text-center">風險</th>
            <th class="p-3 text-right">警戒/停損</th>
            <th class="p-3 text-right">加碼</th>
            <th class="p-3 text-right">停利/目標</th>
            <th class="p-3 text-left">建議/備註</th>
            <th class="p-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedStrategies" :key="item.code" class="hover:bg-gray-800 transition-colors border-b border-gray-800 text-sm">
            <!-- Code (Read-only) -->
            <td class="p-3 font-mono text-neon-yellow text-center">{{ item.code }}</td>
            
            <!-- Name (Read-only) -->
            <td class="p-3 text-left font-bold text-gray-200">{{ item.name }}</td>

            <!-- Holdings -->
            <td class="p-3 text-center text-neon-blue font-mono">
                <input v-if="editingCode === item.code" v-model="editForm.holdings" class="bg-gray-900 text-white w-20 text-center border border-gray-600 focus:border-neon-blue outline-none rounded" type="number" />
                <span v-else>{{ item.holdings }}</span>
            </td>

            <!-- Cost -->
            <td class="p-3 text-right font-mono">
                <input v-if="editingCode === item.code" v-model="editForm.cost" class="bg-gray-900 text-white w-20 text-right border border-gray-600 focus:border-neon-blue outline-none rounded" type="number" />
                <span v-else>{{ item.cost }}</span>
            </td>

            <!-- Current Price -->
            <td class="p-3 text-right font-mono">
                <input v-if="editingCode === item.code" v-model="editForm.currentPrice" class="bg-gray-900 text-white w-20 text-right border border-gray-600 focus:border-neon-blue outline-none rounded" type="number" />
                <div v-else class="flex items-center justify-end gap-2">
                    <span>{{ item.currentPrice }}</span>
                    <button @click="updateSinglePrice(item)" class="text-xs text-gray-500 hover:text-neon-blue transition-colors" :class="{'animate-spin text-neon-blue': loadingPrices[item.code]}" title="更新股價">
                        🔄
                    </button>
                </div>
            </td>

            <!-- Return (Calculated - Read-only) -->
            <td class="p-3 text-right font-bold" :class="getReturnColor(item.returnRate, item.cost, item.currentPrice)">
              {{ calculateReturn(item) }}
            </td>

            <!-- Strategy -->
            <td class="p-3 text-center">
                <select v-if="editingCode === item.code" v-model="editForm.strategy" class="bg-gray-900 text-white text-xs p-1 border border-gray-600 rounded">
                    <option>長期持有</option><option>波段操作</option><option>短線投機</option><option>存股</option>
                </select>
                <span v-else class="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs whitespace-nowrap">{{ item.strategy }}</span>
            </td>

            <!-- Risk -->
             <td class="p-3 text-center">
                <select v-if="editingCode === item.code" v-model="editForm.risk" class="bg-gray-900 text-white text-xs p-1 border border-gray-600 rounded">
                    <option>高</option><option>中</option><option>低</option>
                </select>
                <span v-else :class="getRiskClass(item.risk)" class="px-2 py-1 rounded text-xs whitespace-nowrap">{{ item.risk || '-' }}</span>
            </td>

            <!-- Warning / StopLoss -->
            <td class="p-3 text-red-300 text-right">
                <div v-if="editingCode === item.code" class="flex flex-col gap-1 w-24">
                     <input v-model="editForm.warning" placeholder="警戒" class="bg-gray-900 text-yellow-500 text-xs p-1 border border-gray-600 rounded text-right" />
                     <input v-model="editForm.stopLoss" placeholder="停損" class="bg-gray-900 text-red-500 text-xs p-1 border border-gray-600 rounded text-right" />
                </div>
                <span v-else>{{ item.warning }} / {{ item.stopLoss }}</span>
            </td>

            <!-- Add Point -->
            <td class="p-3 text-right text-blue-300">
                <input v-if="editingCode === item.code" v-model="editForm.addPoint" placeholder="加碼" class="bg-gray-900 text-blue-300 w-20 text-right border border-gray-600 focus:border-neon-blue outline-none rounded" />
                <span v-else>{{ item.addPoint || '-' }}</span>
            </td>

            <!-- TP / Target -->
             <td class="p-3 text-right">
                <div v-if="editingCode === item.code" class="flex flex-col gap-1 w-28 text-right">
                     <div class="flex gap-1">
                        <input v-model="editForm.tp1" placeholder="TP1" class="w-1/2 bg-gray-900 text-green-300 text-xs p-1 border border-gray-600 rounded" />
                        <input v-model="editForm.tp2" placeholder="TP2" class="w-1/2 bg-gray-900 text-green-300 text-xs p-1 border border-gray-600 rounded" />
                     </div>
                     <input v-model="editForm.targetPrice" placeholder="目標" class="bg-gray-900 text-purple-400 text-xs p-1 border border-gray-600 rounded text-right" />
                </div>
                <div v-else>
                    <div class="text-green-300">{{ item.tp1 }} - {{ item.tp2 }}</div>
                    <div v-if="item.targetPrice || editingCode === item.code" class="text-purple-400 font-bold">🎯 {{ item.targetPrice }}</div>
                </div>
             </td>

            <!-- Advice / Notes -->
            <td class="p-3 text-gray-400 max-w-xs relative group">
                <div v-if="editingCode === item.code" class="flex flex-col gap-1 min-w-[150px]">
                     <input v-model="editForm.advice" placeholder="建議" class="bg-gray-900 text-white text-xs p-1 border border-gray-600 rounded" />
                     <input v-model="editForm.notes" placeholder="備註" class="bg-gray-900 text-gray-400 text-xs p-1 border border-gray-600 rounded" />
                </div>
                <div v-else class="flex items-center gap-2">
                    <div class="truncate w-32 text-white" :title="item.advice">{{ item.advice || item.notes }}</div>
                     <button @click="openNoteModal(item)" class="text-gray-500 hover:text-white transition-colors" title="放大查看">
                        🔍
                    </button>
                </div>
            </td>

            <!-- Operations -->
            <td class="p-3 text-center">
                <div v-if="editingCode === item.code" class="flex gap-2 justify-center">
                    <button @click="saveEdit" class="text-green-500 hover:text-green-400 text-lg" title="儲存">💾</button>
                    <button @click="cancelEdit" class="text-gray-500 hover:text-gray-400 text-lg" title="取消">❌</button>
                </div>
                <div v-else class="flex gap-2 justify-center">
                    <button @click="startEdit(item)" class="text-blue-500 hover:text-blue-400 text-lg" title="編輯">✏️</button>
                    <button @click="handleDelete(item.code)" class="text-red-500 hover:text-red-400 transition-colors p-1" title="刪除">
                        🗑️
                    </button>
                </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View (Updated) -->
      <div class="md:hidden grid gap-4">
        <div v-for="item in paginatedStrategies" :key="item.code" class="pixel-card p-4 text-sm relative">
           <button @click="handleDelete(item.code)" class="absolute top-2 right-2 text-red-500">🗑️</button>
          <div class="flex justify-between items-start mb-2 border-b border-gray-700 pb-2 pr-6">
            <div>
              <span class="text-neon-yellow font-bold text-lg">{{ item.code }}</span>
              <span class="ml-2 text-white font-bold">{{ item.name }}</span>
            </div>
            <span class="font-bold text-lg" :class="getReturnColor(item.returnRate, item.cost, item.currentPrice)">{{ calculateReturn(item) }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-gray-300">
             <div class="flex justify-between border-b border-gray-800 pb-1"><span>持倉:</span> <span class="text-neon-blue font-mono">{{ item.holdings }}</span></div>
             <div class="flex justify-between border-b border-gray-800 pb-1"><span>現價:</span> <span class="font-mono">{{ item.currentPrice }}</span></div>
             <div class="flex justify-between text-red-400"><span>警戒:</span> <span>{{ item.warning }}</span></div>
             <div class="flex justify-between text-blue-300"><span>加碼:</span> <span>{{ item.addPoint || '-' }}</span></div>
             <div class="flex justify-between text-green-400"><span>停利:</span> <span>{{ item.tp1 }}</span></div>
             <div v-if="item.targetPrice" class="flex justify-between text-purple-400 font-bold"><span>目標:</span> <span>{{ item.targetPrice }}</span></div>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
              <span class="bg-blue-900 text-blue-200 px-2 py-1 rounded text-center">{{ item.strategy }}</span>
              <span :class="getRiskClass(item.risk)" class="px-2 py-1 rounded text-center">風險: {{ item.risk || '-' }}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500 bg-black p-2 rounded relative">
             <div class="flex justify-between items-start">
                  <div class="line-clamp-2">
                     <span v-if="item.advice" class="text-white">💡 {{ item.advice }}</span>
                     <span v-else>📝 {{ item.notes }}</span>
                  </div>
                   <button @click="openNoteModal(item)" class="text-gray-400 hover:text-white ml-2">🔍</button>
             </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-6 p-4">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="pixel-btn px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          :class="currentPage === 1 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-500'"
        >
          ◀ PREV
        </button>
        
        <span class="text-neon-yellow font-bold text-lg font-mono">
          PAGE {{ currentPage }} / {{ totalPages }}
        </span>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pixel-btn px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          :class="currentPage === totalPages ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-500'"
        >
          NEXT ▶
        </button>
      </div>
    </div>

    <!-- Wizard Modal -->
    <StrategyWizard :isOpen="isWizardOpen" @close="isWizardOpen = false" @refresh="fetchData" />

    <!-- Detail Modal -->
    <div v-if="selectedNoteItem" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" @click.self="selectedNoteItem = null">
        <div class="pixel-card bg-gray-900 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative text-gray-200">
             <button @click="selectedNoteItem = null" class="absolute top-2 right-2 text-red-500 text-xl font-bold">X</button>
             <h3 class="text-xl text-neon-yellow mb-4 font-bold flex items-center gap-2">
                <span>{{ selectedNoteItem.name }} ({{ selectedNoteItem.code }})</span>
                <span :class="getRiskClass(selectedNoteItem.risk)" class="text-xs px-2 py-1 rounded">{{ selectedNoteItem.risk }}風險</span>
             </h3>
             
             <div class="space-y-4">
                 <div v-if="selectedNoteItem.advice">
                    <h4 class="text-neon-green font-bold mb-1">💡 分析建議 (Analysis)</h4>
                    <p class="bg-black p-3 rounded leading-relaxed whitespace-pre-line">{{ selectedNoteItem.advice }}</p>
                 </div>
                 <div v-if="selectedNoteItem.notes">
                    <h4 class="text-gray-400 font-bold mb-1">📝 備註 (Notes)</h4>
                    <p class="bg-black p-3 rounded leading-relaxed text-gray-400 whitespace-pre-line">{{ selectedNoteItem.notes }}</p>
                 </div>
             </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import StrategyWizard from '../components/StrategyWizard.vue';
import { getStrategies, deleteStrategy, updateStrategy, fetchStockPrice } from '../services/googleSheet';

const isWizardOpen = ref(false);
const strategies = ref([]);
const selectedNoteItem = ref(null);
const editingCode = ref(null);
const editForm = ref({});
const loadingPrices = ref({});

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 7;

// Computed Pagination

const totalPages = computed(() => Math.ceil(strategies.value.length / itemsPerPage));

const paginatedStrategies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return strategies.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const startEdit = (item) => {
    editingCode.value = item.code;
    editForm.value = { ...item };
};

const cancelEdit = () => {
    editingCode.value = null;
    editForm.value = {};
};

const saveEdit = async () => {
    // Optimistic Update
    const original = strategies.value.find(s => s.code === editingCode.value);
    Object.assign(original, editForm.value);
    
    const code = editingCode.value;
    const form = { ...editForm.value };
    
    editingCode.value = null; // Exit edit mode immediately
    
    try {
        const res = await updateStrategy(form);
        if (res.status !== 'success') throw new Error(res.message);
    } catch (e) {
        console.error(e);
        alert('Update failed: ' + e.message);
        fetchData(); // Revert
    }
};

const openWizard = () => {
  isWizardOpen.value = true;
};

const openNoteModal = (item) => {
    selectedNoteItem.value = item;
};

const fetchData = async () => {
  strategies.value = await getStrategies();
  // Ensure we don't get stuck on a page that doesn't exist after data refresh
  if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
  }
};

const handleDelete = async (code) => {
    if (confirm(`確定要刪除 ${code} 嗎？此動作無法復原。`)) {
        // Optimistic UI update
        const originalList = [...strategies.value];
        strategies.value = strategies.value.filter(s => s.code !== code);
        
        try {
            const res = await deleteStrategy(code);
            if (res.status !== 'success') {
                throw new Error(res.message);
            }
        } catch (e) {
            alert('刪除失敗: ' + e.message);
        }
    }
};

const updateSinglePrice = async (item) => {
    if (loadingPrices.value[item.code]) return;
    loadingPrices.value[item.code] = true;
    
    try {
        const res = await fetchStockPrice(item.code);
        
        if (res && res.status === 'success' && res.price) {
            // Update local state
            item.currentPrice = res.price;
            // Send FULL object to ensure we don't overwrite with partial data
            // We use { ...item } to ensure we send a plain object copy
            await updateStrategy({ ...item });
        } else {
            console.warn('無法取得現價', item.code);
            // Optional: Show subtle UI feedback like a red dot or shake
        }
    } catch (err) {
        console.error('Update price error', err);
    } finally {
         loadingPrices.value[item.code] = false;
    }
};

const calculateReturn = (item) => {
    if (item.returnRate) return item.returnRate;
    if (item.cost && item.currentPrice) {
        const r = ((item.currentPrice - item.cost) / item.cost) * 100;
        return r.toFixed(2) + '%';
    }
    return '-';
};

const getReturnColor = (rateStr, cost, current) => {
    let val = 0;
    if (rateStr && typeof rateStr === 'string' && rateStr.includes('%')) {
        val = parseFloat(rateStr.replace('%', ''));
    } else if (cost && current) {
         val = ((current - cost) / cost) * 100;
    }
    // Taiwan: Red is Positive (Up), Green is Negative (Down)
    if (val > 0) return 'text-red-500';
    if (val < 0) return 'text-green-500';
    return 'text-gray-400';
};

const getRiskClass = (risk) => {
    if (!risk) return 'bg-gray-800 text-gray-400';
    if (risk.includes('高')) return 'bg-red-900 text-red-200';
    if (risk.includes('中')) return 'bg-yellow-900 text-yellow-200';
    if (risk.includes('低')) return 'bg-green-900 text-green-200';
    return 'bg-gray-700 text-gray-300';
};

onMounted(() => {
  fetchData();
});
</script>
