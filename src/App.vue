<template>
  <v-app>
    <v-main class="bg-background">
      <v-container fluid class="pa-4 pa-md-8" style="max-width: 800px;">

        <!-- Header -->
        <header class="app-header mb-8">
          <div class="d-flex align-center ga-3 mb-2">
            <div class="header-icon">
              <v-icon icon="mdi-ballot-outline" size="24" color="white" />
            </div>
            <div>
              <h1 class="app-title">ถอดรหัสบาร์โค้ดบัตรเลือกตั้ง</h1>
              <p class="app-subtitle">ประเทศไทย 2569</p>
            </div>
          </div>
        </header>


        <!-- Warning -->
        <section class="warning-box mb-5">
          <div class="warning-icon">⚠</div>
          <div class="warning-content">
            <p>
              <strong class="accent-warm">บาร์โค้ดที่มีเลขเฉพาะไม่ซ้ำกัน</strong>แต่ละใบ
              สามารถคำนวณย้อนหา<strong class="accent-warm">เล่มที่</strong>ได้ง่ายๆ —
              เมื่อรู้เล่มที่ → รู้ต้นขั้ว → ต้นขั้วมีลายเซ็นและลำดับที่ →
              <strong class="accent-green text-decoration-underline">ทำให้รู้ว่าใครกาเบอร์อะไรได้</strong>
            </p>
            <p class="mt-1 muted">
              ตาม รธน. การเลือกตั้งต้องเป็นไปโดย "ลับ" — หากสืบย้อนได้ ขัดรัฐธรรมนูญ
            </p>
          </div>
        </section>

        <!-- Laws -->
        <section class="section-card mb-5">
          <v-expansion-panels variant="accordion" flat>
            <v-expansion-panel bg-color="transparent" elevation="0">
              <v-expansion-panel-title class="laws-title pa-0">
                <div class="section-label mb-0">
                  <v-icon icon="mdi-scale-balance" size="16" class="mr-1" />
                  กฎหมายที่เกี่ยวข้อง — พ.ร.บ.ประกอบ รธน. เลือกตั้ง ส.ส.
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-4" style="line-height: 1.8; color: #555;">
                  บาร์โค้ดที่มีเลขเฉพาะแต่ละใบ สามารถคำนวณย้อนหาเล่มที่ → ต้นขั้ว → ตัวตนผู้ลงคะแนนได้
                  ซึ่งอาจขัดต่อกฎหมายอย่างน้อย <strong class="accent-warm">4 มาตรา</strong> (รธน. 1 + พ.ร.บ.ประกอบ รธน. 3)
                </p>

                <div class="law-item" v-for="law in laws" :key="law.section">
                  <div class="d-flex align-center ga-2 mb-1">
                    <v-chip :color="law.color" size="x-small" variant="flat" class="font-weight-bold">{{ law.section }}</v-chip>
                    <span class="text-body-2 font-weight-medium" style="color: #333;">{{ law.title }}</span>
                  </div>
                  <div v-if="law.quote" class="law-quote mb-2">{{ law.quote }}</div>
                  <p class="text-body-2" style="color: #666; line-height: 1.7;" v-html="law.description"></p>
                </div>

                <div class="caution-box mt-3">
                  <strong>⚠ ข้อสังเกต</strong> —
                  กฎหมายเลือกตั้งออกแบบเพื่อปกป้อง<strong class="accent-warm">ความลับของผู้ลงคะแนน</strong>
                  ทั้ง 4 มาตรานี้มุ่งเน้นเรื่องเดียวกัน — ไม่ให้มีทางสืบได้ว่าใครลงคะแนนให้ใคร
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </section>

        <!-- History -->
        <section v-if="history.length > 0" class="section-card mb-5" ref="historySection">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="section-label mb-0">
              <v-icon icon="mdi-history" size="16" class="mr-1" />
              ประวัติ ({{ history.length }})
            </div>
            <div class="d-flex ga-1">
              <v-btn
                size="x-small"
                variant="tonal"
                color="primary"
                @click="exportToJpg"
                :loading="exporting === 'jpg'"
                class="export-btn"
              >
                <v-icon icon="mdi-image-outline" size="14" class="mr-1" />
                JPG
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="success"
                @click="exportToExcel"
                :loading="exporting === 'excel'"
                class="export-btn"
              >
                <v-icon icon="mdi-file-excel-outline" size="14" class="mr-1" />
                Excel
              </v-btn>
            </div>
          </div>
          <v-table density="compact" class="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>เลขที่บัตร</th>
                <th>เล่มที่</th>
                <th class="text-center">M</th>
                <th class="text-center">ลำดับ</th>
                <th>สูตร</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in paginatedHistory" :key="i">
                <td class="text-caption muted">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="accent-warm font-weight-medium">{{ item.ballotDisplay }}</td>
                <td class="accent-green font-weight-medium">{{ item.bookDisplay }}</td>
                <td class="text-center">{{ item.M }}</td>
                <td class="text-center">{{ item.position }}/20</td>
                <td>
                  <code class="text-caption muted">⌊{{ item.N }}/20⌋+1 = {{ item.M }}</code>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="totalPages > 1" class="d-flex justify-center mt-3">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              size="small"
              density="comfortable"
              rounded
              color="primary"
            />
          </div>
        </section>

        <!-- Decoder Card — Primary Action -->
        <section class="section-card mb-5 ">
          <div class="section-label">
            <v-icon icon="mdi-magnify" size="16" class="mr-1" />
            ถอดรหัส
          </div>
          <div class="d-flex align-center ga-3 ">
            <v-text-field
              v-model="inputBallot"
              variant="outlined"
              density="comfortable"
              placeholder="กรอกเลขบัตร เช่น A20516201"
              hide-details
              clearable
              class="flex-grow-1 input-field"
              @keyup.enter="decode"
              color="primary"
              bg-color="white"
            />
            <v-btn
              color="primary"
              size="large"
              variant="flat"
              @click="decode"
              :disabled="!inputBallot"
              class="decode-btn"
            >
              ถอดรหัส
            </v-btn>
          </div>

          <!-- Sample Chips -->
          <div class="mt-3 d-flex align-center flex-wrap ga-2">
            <span class="text-caption muted">ตัวอย่าง:</span>
            <v-chip
              v-for="sample in samples"
              :key="sample"
              size="x-small"
              variant="outlined"
              class="sample-chip"
              @click="useSample(sample)"
            >
              {{ sample }}
            </v-chip>
          </div>

          <!-- Results -->
          <v-expand-transition>
            <div v-if="result" class="mt-5">
              <v-row dense>
                <v-col cols="12" sm="4">
                  <div class="result-tile">
                    <span class="result-label">เลขที่บัตร (N)</span>
                    <span class="result-value accent-warm">{{ result.ballotDisplay }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="result-tile result-tile--primary">
                    <span class="result-label">เล่มที่ (M)</span>
                    <div class="d-flex align-center justify-center ga-1">
                      <span class="result-value accent-green">{{ result.bookDisplay }}</span>
                      <v-btn icon variant="text" size="x-small" @click="copyToClipboard(result.bookDisplay)">
                        <v-icon icon="mdi-content-copy" size="14" />
                      </v-btn>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="result-tile">
                    <span class="result-label">ลำดับในเล่ม</span>
                    <span class="result-value">ใบที่ {{ result.position }}<span class="muted"> / 20</span></span>
                  </div>
                </v-col>
              </v-row>

              <!-- Formula -->
              <div class="formula-bar mt-3">
                <code>M = ⌊{{ result.N }} / 20⌋ + 1 = ⌊{{ result.divResult }}⌋ + 1 = {{ result.floorResult }} + 1 = <strong>{{ result.M }}</strong></code>
              </div>
            </div>
          </v-expand-transition>
        </section>

        <!-- Scanner Card -->
        <section class="section-card mb-5">
          <div class="section-label">
            <v-icon icon="mdi-camera-outline" size="16" class="mr-1" />
            สแกนจากภาพ
          </div>

          <!-- Upload Area -->
          <div
            class="upload-area"
            :class="{ 'upload-area--active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect" />
            <v-icon icon="mdi-cloud-upload-outline" size="36" class="upload-icon mb-2" />
            <div class="text-body-2">คลิกหรือลากภาพมาวาง</div>
            <div class="text-caption muted">JPG, PNG — ภาพบัตรเลือกตั้งที่มีบาร์โค้ด</div>
          </div>

          <!-- Preview & Scan Results -->
          <v-expand-transition>
            <div v-if="scanPreview" class="mt-4">
              <v-row dense>
                <v-col cols="12" sm="5">
                  <v-img :src="scanPreview" max-height="180" rounded="lg" cover class="preview-img" />
                </v-col>
                <v-col cols="12" sm="7" class="d-flex flex-column justify-center">
                  <div v-if="scanning" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary" size="28" width="2" class="mb-2" />
                    <div class="text-body-2 muted">กำลังสแกน...</div>
                  </div>
                  <div v-else-if="scanResults.length > 0">
                    <div class="text-caption muted mb-2">
                      <v-icon icon="mdi-check-circle" size="14" color="success" class="mr-1" />
                      พบ {{ scanResults.length }} บาร์โค้ด
                    </div>
                    <div v-for="(code, idx) in scanResults" :key="idx" class="mb-2">
                      <v-chip color="primary" variant="flat" size="small" class="font-weight-medium" @click="useScanResult(code.decoded)">
                        {{ code.decoded }}
                      </v-chip>
                      <span class="text-caption muted ml-2">({{ code.raw }})</span>
                    </div>
                    <div class="text-caption muted mt-1">คลิกเพื่อถอดรหัส</div>
                  </div>
                  <div v-else-if="scanError">
                    <v-alert type="warning" variant="tonal" density="compact" class="text-body-2">
                      {{ scanError }}
                    </v-alert>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <!-- Prefix note -->
          <div class="mt-3 d-flex align-center ga-2">
            <v-icon icon="mdi-information-outline" size="14" class="muted" />
            <span class="text-caption muted">แปลงเลขนำหน้า: 0 → A, 1 → B</span>
          </div>

          <!-- Dynamsoft tip -->
          <div class="tip-box mt-3">
            <div class="tip-title">💡 ภาพไม่ชัด?</div>
            <div class="tip-body">
              ลองใช้
              <a href="https://demo.dynamsoft.com/barcode-reader/" target="_blank" rel="noopener" class="link">
                Dynamsoft Barcode Reader
                <v-icon icon="mdi-open-in-new" size="11" />
              </a>
              อัพโหลดภาพเดิม → นำเลขที่ได้มากรอกด้านบน
            </div>
            <div class="mt-2">
              <img
                src="/dynamsoft-example.png"
                alt="ตัวอย่างผลลัพธ์จาก Dynamsoft"
                class="tip-img"
              />
            </div>
          </div>
        </section>

        <!-- Flow Diagram -->
        <section class="section-card mb-5">
          <div class="section-label">
            <v-icon icon="mdi-sitemap-outline" size="16" class="mr-1" />
            ค้นหาต้นขั้วยังไง?
          </div>
          <div class="flow-chain">
            <span class="flow-node">บาร์โค้ด</span>
            <v-icon icon="mdi-chevron-right" size="16" class="flow-arrow" />
            <v-chip size="small" color="warning" variant="flat" class="flow-chip">เลขที่ (N)</v-chip>
            <v-icon icon="mdi-chevron-right" size="16" class="flow-arrow" />
            <v-chip size="small" color="primary" variant="flat" class="flow-chip">เล่มที่ (M)</v-chip>
            <v-icon icon="mdi-chevron-right" size="16" class="flow-arrow" />
            <v-chip size="small" variant="flat" class="flow-chip" style="background: #E74C3C; color: white;">ต้นขั้ว</v-chip>
            <v-icon icon="mdi-chevron-right" size="16" class="flow-arrow" />
            <v-chip size="small" variant="flat" class="flow-chip" style="background: #8E44AD; color: white;">ลายเซ็น + ลำดับ</v-chip>
            <v-icon icon="mdi-chevron-right" size="16" class="flow-arrow" />
            <v-chip size="small" variant="flat" class="flow-chip" style="background: #C0392B; color: white;">ตัวตนผู้ลงคะแนน</v-chip>
          </div>
        </section>

        <!-- Math & Example Section -->
        <section class="section-card mb-5">
          <div class="section-label">
            <v-icon icon="mdi-function-variant" size="16" class="mr-1" />
            อธิบายหลักคณิตศาสตร์
          </div>

          <!-- Formula Definition -->
          <div class="code-block mb-4">
            <pre class="example-calc"><span class="muted">// กำหนดให้</span>
<span class="accent-warm font-weight-bold">M</span> = เล่มที่ (Book ID)
<span class="accent-warm font-weight-bold">N</span> = เลขที่บัตร
      (Ballot Number จากบาร์โค้ด)

<span class="muted">// สูตร</span>
<strong style="color: #FFF; font-size: 1.1em;">M = ⌊N / 20⌋ + 1</strong></pre>
          </div>

          <!-- Explanation -->
          <div class="explain-item mb-2">
            <strong class="accent-warm">ทำไม 20?</strong>
            <span> — กกต. ระบุว่าบัตรเลือกตั้ง 1 เล่ม มี <strong>20 ฉบับ</strong></span>
          </div>
          <div class="explain-item mb-4">
            <strong class="accent-warm">แปลว่าอะไร?</strong>
            <span> — เลขที่บัตร (N) จะเรียงลำดับต่อเนื่องไปเรื่อยๆ ไม่มีซ้ำ แต่ละเล่มจะมี 20 ใบ</span>
          </div>

          <!-- Book range example -->
          <div class="code-block mb-5">
            <pre class="example-calc">เล่ม 1 = บัตร 1–20
เล่ม 2 = บัตร 21–40
เล่ม 3 = บัตร 41–60 ...</pre>
          </div>

          <v-divider class="mb-5" />

          <!-- Example Calculation -->
          <div class="section-label">
            <v-icon icon="mdi-lightbulb-outline" size="16" class="mr-1" />
            ตัวอย่างการคำนวณ
          </div>
          <div class="code-block">
            <pre class="example-calc">บาร์โค้ด:  <span class="accent-warm">A01435761</span>
N = 1435761
M = ⌊1435761 / 20⌋ + 1
  = ⌊71788.05⌋ + 1
  = 71788 + 1 = <strong class="accent-green">71789</strong>
เล่มที่ = <span class="accent-warm font-weight-bold">A0071789</span>
ลำดับในเล่ม = 1435761 mod 20
  = <strong>1</strong>  (ใบที่ 1 จาก 20)</pre>
          </div>

          <div class="section-sublabel mt-5">การคำนวณด้วย JavaScript</div>
          <div class="code-block">
            <pre><code>function getBallotBookId(ballotId) {
  const prefix = ballotId.slice(0, 1);
  const N = parseInt(ballotId.slice(1), 10);
  const start = Math.floor(N / 20);
  return prefix + String(start + 1).padStart(7, "0");
}</code></pre>
          </div>

          <div class="mt-3">
            <a
              href="https://codepen.io/earthchie/pen/vEKbZBb?editors=1010"
              target="_blank"
              rel="noopener noreferrer"
              class="link text-caption"
            >
              <v-icon icon="mdi-open-in-new" size="13" class="mr-1" />
              CodePen ต้นฉบับ (earthchie)
            </a>
          </div>
        </section>


        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :timeout="1500" color="primary" location="bottom center">
          <v-icon icon="mdi-check" class="mr-1" /> คัดลอกแล้ว
        </v-snackbar>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

const inputBallot = ref('')
const result = ref(null)
const history = ref([])
const snackbar = ref(false)
const exporting = ref(null)
const historySection = ref(null)

// Pagination
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(history.value.length / pageSize))
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return history.value.slice(start, start + pageSize)
})

// Scanner state
const isDragging = ref(false)
const scanPreview = ref(null)
const scanning = ref(false)
const scanResults = ref([])
const scanError = ref(null)
const fileInput = ref(null)

const samples = [
  'A37804930', 'A20516201', 'A37805049', 'A37805050', 'A37805055',
  'A01435761'
]

// Law data
const laws = [
  {
    section: 'รธน. มาตรา 85',
    color: 'error',
    title: 'การเลือกตั้ง ส.ส. ต้องเป็นไปโดย "โดยตรงและลับ"',
    description: 'รัฐธรรมนูญ 2560 มาตรา 85 บัญญัติว่า การเลือกตั้ง ส.ส. แบบแบ่งเขต ให้ใช้วิธี <strong>ออกเสียงลงคะแนนโดยตรงและลับ</strong> — หากบาร์โค้ดเฉพาะใบสามารถสืบย้อนตัวตนผู้ลงคะแนนได้ ย่อม <strong>ขัดหลัก "ลับ"</strong> ที่รัฐธรรมนูญคุ้มครอง',
    quote: '\"ให้ใช้วิธีออกเสียงลงคะแนนโดยตรงและลับ\"',
  },
  {
    section: 'พ.ร.บ. มาตรา 93',
    color: 'info',
    title: 'บังคับพับบัตร — มิให้ผู้อื่นทราบว่าลงคะแนนอย่างไร',
    description: 'เมื่อทำเครื่องหมายกากบาทแล้ว ให้ <strong>พับบัตรเลือกตั้งเพื่อมิให้ผู้อื่นทราบว่าลงคะแนนอย่างไร</strong> แล้วจึงนำใส่หีบบัตร — แต่หากบาร์โค้ดด้านนอกบัตร (เห็นได้โดยไม่ต้องเปิด) สามารถระบุใบบัตรได้ การพับก็ไม่ช่วยปกป้องความลับ',
    quote: '\"ให้พับบัตรเลือกตั้งเพื่อมิให้ผู้อื่นทราบว่าลงคะแนนอย่างไร\"',
  },
  {
    section: 'พ.ร.บ. มาตรา 96',
    color: 'warning',
    title: 'ห้ามทำเครื่องหมายเพื่อเป็นที่สังเกตบนบัตร',
    description: '<strong>ห้ามมิให้ผู้ใดจงใจทำเครื่องหมายเพื่อเป็นที่สังเกต</strong> โดยวิธีใดไว้ที่บัตรเลือกตั้ง — บาร์โค้ดที่มีเลขเฉพาะไม่ซ้ำกันแต่ละใบ ถือเป็น "เครื่องหมาย" ที่แยกบัตรแต่ละใบออกจากกันได้ อาจเข้าข่ายฝ่าฝืนมาตรานี้',
    quote: '\"ห้ามมิให้ผู้ใดจงใจทำเครื่องหมายเพื่อเป็นที่สังเกตโดยวิธีใดไว้ที่บัตรเลือกตั้ง\"',
  },
  {
    section: 'พ.ร.บ. มาตรา 99',
    color: 'secondary',
    title: 'ห้ามแสดงบัตรให้ผู้อื่นทราบว่าลงคะแนนอย่างไร',
    description: 'ห้ามมิให้ผู้มีสิทธิเลือกตั้ง <strong>นำบัตรเลือกตั้งที่ออกเสียงลงคะแนนแล้วแสดงต่อผู้อื่น</strong> — แต่บาร์โค้ดบนบัตรสามารถสแกนจากภาพถ่ายและคำนวณย้อนหาเล่มที่ได้ จึงอาจเป็นช่องทางให้ "รู้" โดยอ้อม',
    quote: '\"ห้ามมิให้ผู้มีสิทธิเลือกตั้งนำบัตรเลือกตั้งที่ออกเสียงลงคะแนนแล้วแสดงต่อผู้อื่น\"',
  },
]

// Prefix mapping
const prefixMap = { '0': 'A', '1': 'B' }

function mapBarcodePrefix(rawBarcode) {
  const str = String(rawBarcode).trim()
  if (/^[A-Z]/i.test(str)) return str.toUpperCase()
  const firstChar = str.charAt(0)
  const prefix = prefixMap[firstChar]
  if (prefix) return prefix + str.slice(1)
  return 'A' + str
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileSelect(e) {
  const file = e.target?.files?.[0]
  if (file) processFile(file)
  if (e.target) e.target.value = ''
}

// ZXing reader setup
function createReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.ITF,
    BarcodeFormat.UPC_A,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints)
}

// Load image into an HTMLImageElement
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Scan barcode from image URL using ZXing
async function scanWithZXing(imageSrc) {
  const reader = createReader()
  try {
    const img = await loadImage(imageSrc)
    const result = reader.decodeFromImage(img)
    return result ? [result] : []
  } catch {
    return []
  }
}

// Create a cropped version of the image (top portion)
function cropImageTop(imgSrc, ratio = 0.35) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = Math.floor(img.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, canvas.height, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.onerror = () => resolve(null)
    img.src = imgSrc
  })
}

// Process uploaded file
async function processFile(file) {
  if (!file.type.startsWith('image/')) return
  const objectUrl = URL.createObjectURL(file)
  scanPreview.value = objectUrl
  scanResults.value = []
  scanError.value = null
  scanning.value = true

  try {
    const allResults = []

    // Attempt 1: Full image
    const r1 = await scanWithZXing(objectUrl)
    allResults.push(...r1)

    // Attempt 2: Crop top 30%
    if (allResults.length === 0) {
      const croppedSrc = await cropImageTop(objectUrl, 0.3)
      if (croppedSrc) {
        const r2 = await scanWithZXing(croppedSrc)
        allResults.push(...r2)
      }
    }

    // Attempt 3: Crop top 50%
    if (allResults.length === 0) {
      const croppedSrc2 = await cropImageTop(objectUrl, 0.5)
      if (croppedSrc2) {
        const r3 = await scanWithZXing(croppedSrc2)
        allResults.push(...r3)
      }
    }

    // Attempt 4: Crop bottom 40% (barcode might be at bottom)
    if (allResults.length === 0) {
      const croppedBottom = await cropImageBottom(objectUrl, 0.4)
      if (croppedBottom) {
        const r4 = await scanWithZXing(croppedBottom)
        allResults.push(...r4)
      }
    }

    // De-duplicate
    const seen = new Set()
    const unique = allResults.filter(r => {
      const code = r.getText()
      if (!code || seen.has(code)) return false
      seen.add(code)
      return true
    })

    if (unique.length > 0) {
      scanResults.value = unique.map(r => ({
        raw: r.getText(),
        decoded: mapBarcodePrefix(r.getText()),
        format: r.getBarcodeFormat(),
      }))
    } else {
      scanError.value = 'ไม่พบบาร์โค้ดในภาพ — ลองถ่ายภาพให้ชัดขึ้น หรือครอปเฉพาะส่วนบาร์โค้ด'
    }
  } catch (err) {
    console.error('Scan error:', err)
    scanError.value = 'เกิดข้อผิดพลาดในการสแกน — ลองอัพโหลดภาพใหม่'
  } finally {
    scanning.value = false
  }
}

// Crop bottom portion of image
function cropImageBottom(imgSrc, ratio = 0.4) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = Math.floor(img.height * ratio)
      const ctx = canvas.getContext('2d')
      const sy = img.height - canvas.height
      ctx.drawImage(img, 0, sy, img.width, canvas.height, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.onerror = () => resolve(null)
    img.src = imgSrc
  })
}

function useScanResult(code) {
  inputBallot.value = code
  decode()
  document.querySelector('.result-tile')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function decode() {
  if (!inputBallot.value) return
  const raw = inputBallot.value.trim().toUpperCase()
  const match = raw.match(/^([A-Z]*)(\d+)$/)
  if (!match) return

  const prefix = match[1] || ''
  const N = parseInt(match[2], 10)
  if (isNaN(N)) return

  const divResult = N / 20
  const floorResult = Math.floor(divResult)
  const M = floorResult + 1
  const remainder = N % 20
  const position = remainder === 0 ? 20 : remainder

  const decoded = {
    ballotDisplay: raw,
    bookDisplay: prefix + M,
    N, M,
    divResult: divResult % 1 === 0 ? divResult.toFixed(1) : parseFloat(divResult.toFixed(4)),
    floorResult, position,
  }

  result.value = decoded
  const existingIndex = history.value.findIndex(h => h.ballotDisplay === decoded.ballotDisplay)
  if (existingIndex !== -1) history.value.splice(existingIndex, 1)
  history.value.unshift(decoded)
}

function useSample(sample) {
  inputBallot.value = sample
  decode()
}

// Export history to JPG
async function exportToJpg() {
  if (!historySection.value) return
  exporting.value = 'jpg'
  try {
    const canvas = await html2canvas(historySection.value, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `ballot-history-${new Date().toISOString().slice(0, 10)}.jpg`
    canvas.toBlob((blob) => {
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    }, 'image/jpeg', 0.95)
  } catch (err) {
    console.error('Export JPG error:', err)
  } finally {
    exporting.value = null
  }
}

// Export history to Excel
function exportToExcel() {
  exporting.value = 'excel'
  try {
    const data = history.value.map((item, i) => ({
      'ลำดับ': i + 1,
      'เลขที่บัตร': item.ballotDisplay,
      'N (ตัวเลข)': item.N,
      'เล่มที่ (M)': item.bookDisplay,
      'M (ตัวเลข)': item.M,
      'ลำดับในเล่ม': item.position,
      'สูตร': `⌊${item.N}/20⌋+1 = ${item.M}`,
    }))
    const ws = XLSX.utils.json_to_sheet(data)

    // Column widths
    ws['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 16 }, // เลขที่บัตร
      { wch: 12 }, // N
      { wch: 16 }, // เล่มที่
      { wch: 10 }, // M
      { wch: 12 }, // ลำดับในเล่ม
      { wch: 24 }, // สูตร
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'ประวัติถอดรหัส')
    XLSX.writeFile(wb, `ballot-history-${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (err) {
    console.error('Export Excel error:', err)
  } finally {
    exporting.value = null
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    snackbar.value = true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    snackbar.value = true
  }
}
</script>

<style>
/* ============ BASE ============ */
* {
  font-family: 'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

html {
  overflow-y: auto !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code, pre, .formula-bar code, .example-calc, .code-block pre, .code-block code {
  font-family: 'IBM Plex Mono', 'JetBrains Mono', 'Consolas', monospace !important;
}

.muted {
  color: #999 !important;
}

.accent-warm {
  color: #D97706 !important;
}

.accent-green {
  color: #1A6B5C !important;
}

/* ============ HEADER ============ */
.app-header {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1A6B5C 0%, #2AAA8A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.8rem;
  color: #999;
  font-weight: 400;
  margin: 0;
}

/* ============ SECTION CARDS ============ */
.section-card {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 12px;
  padding: 20px;
}

.section-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1A6B5C;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.section-sublabel {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.explain-item {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.6;
}

/* ============ INPUT ============ */
.input-field .v-field {
  border-radius: 10px !important;
}

.decode-btn {
  border-radius: 10px !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  min-width: 100px !important;
}

/* ============ SAMPLE CHIPS ============ */
.sample-chip {
  cursor: pointer;
  transition: all 0.15s ease;
  border-color: #ddd !important;
  color: #888 !important;
  font-size: 0.7rem !important;
}

.sample-chip:hover {
  border-color: #1A6B5C !important;
  color: #1A6B5C !important;
}

/* ============ RESULTS ============ */
.result-tile {
  background: #F8F8F6;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
  transition: transform 0.2s ease;
}

.result-tile:hover {
  transform: translateY(-1px);
}

.result-tile--primary {
  background: #F0FAF7;
  border-color: rgba(26, 107, 92, 0.12);
}

.result-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #999;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.result-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
}

/* ============ FORMULA ============ */
.formula-bar {
  background: #F8F8F6;
  border-left: 3px solid #1A6B5C;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
}

.formula-bar code {
  font-size: 0.8rem;
  color: #666;
  word-break: break-all;
}

/* ============ UPLOAD ============ */
.upload-area {
  border: 2px dashed #D5D3CD;
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #FCFCFB;
}

.upload-area:hover {
  border-color: #1A6B5C;
  background: #F5FBF9;
}

.upload-area--active {
  border-color: #1A6B5C;
  background: #EDF8F5;
  transform: scale(1.005);
}

.upload-icon {
  color: #BBB;
}

.upload-area:hover .upload-icon {
  color: #1A6B5C;
}

.preview-img {
  border: 1px solid rgba(0,0,0,0.06);
}

/* ============ TIP BOX ============ */
.tip-box {
  background: #F5F9FE;
  border: 1px solid #D6E4F0;
  border-radius: 10px;
  padding: 14px 16px;
}

.tip-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563EB;
  margin-bottom: 4px;
}

.tip-body {
  font-size: 0.82rem;
  color: #555;
  line-height: 1.6;
}

.tip-img {
  width: 100%;
  max-width: 520px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
}

/* ============ FLOW ============ */
.flow-chain {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.flow-node {
  font-size: 0.8rem;
  color: #777;
  font-weight: 500;
}

.flow-arrow {
  color: #CCC !important;
}

.flow-chip {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
}

/* ============ CODE BLOCKS ============ */
.code-block {
  background: #2D2D2D;
  border-radius: 10px;
  padding: 16px 18px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  line-height: 1.7;
}

.code-block code,
.code-block pre {
  color: #E0E0E0;
  font-size: 0.8rem;
}

.example-calc {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.8;
  color: #E0E0E0;
  font-size: 0.8rem;
}

/* ============ LINKS ============ */
.link {
  color: #2563EB;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s;
}

.link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

/* ============ WARNING ============ */
.warning-box {
  display: flex;
  gap: 14px;
  background: #FFFBF0;
  border: 1px solid #F0E3C0;
  border-radius: 12px;
  padding: 18px 20px;
}

.warning-icon {
  font-size: 1.6rem;
  line-height: 1;
  flex-shrink: 0;
}

.warning-content {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.7;
}

.warning-content p {
  margin: 0;
}

/* ============ LAWS ============ */
.laws-title {
  min-height: unset !important;
}

.law-item {
  padding: 12px 14px;
  background: #F9F9F7;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid rgba(0,0,0,0.04);
}

.law-item p {
  margin: 0;
}

.law-quote {
  font-size: 0.8rem;
  font-style: italic;
  color: #888;
  border-left: 2px solid #D5D3CD;
  padding-left: 10px;
  margin-left: 4px;
}

.caution-box {
  background: #FFFBF0;
  border: 1px solid #F0E3C0;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.82rem;
  color: #666;
  line-height: 1.6;
}

/* ============ EXPORT ============ */
.export-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
  border-radius: 8px !important;
  font-size: 0.7rem !important;
}

/* ============ HISTORY ============ */
.history-table {
  background: transparent !important;
}

.history-table th {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  color: #999 !important;
  border-bottom: 1px solid rgba(0,0,0,0.06) !important;
}

.history-table td {
  font-size: 0.82rem !important;
  border-bottom: 1px solid rgba(0,0,0,0.04) !important;
}

.history-table tbody tr:hover {
  background: rgba(26, 107, 92, 0.03) !important;
}

/* ============ FIX VUETIFY OVERRIDES ============ */
.v-expansion-panel-text__wrapper {
  padding: 0 !important;
  padding-top: 12px !important;
}
</style>
