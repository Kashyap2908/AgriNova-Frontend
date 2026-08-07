/**
 * PDF / Printable Field Schedule Generator
 * Generates a clean, professional, field-ready PDF document for farmers.
 */

export const generatePlanPDF = (plan) => {
  if (!plan) return;

  const crop = plan.crop_summary?.crop || 'Crop';
  const areaDisplay = plan.crop_summary?.area_display || `${plan.crop_summary?.farm_area || 1} ${plan.crop_summary?.area_unit || 'Acres'}`;
  const soilType = plan.crop_summary?.soil_type || 'Loamy';
  const state = plan.crop_summary?.state || 'India';
  const season = plan.crop_summary?.season || 'Kharif';
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const selectedPlan = plan.top_fertilizer_plans?.[0] || {};
  const schedule = plan.selected_plan_schedule || plan.stage_schedule || [];
  const protection = plan.protection_plan || {};
  const weather = plan.weather_advisory || {};
  const costSummary = plan.cost_summary || {};
  const recId = `AG-REC-${Math.floor(100000 + Math.random() * 900000)}`;

  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AgriNova - Smart Crop Nutrition & Protection Plan (${crop})</title>
      <style>
        @page {
          size: A4;
          margin: 10mm 12mm;
        }
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.45;
          font-size: 10.5px;
          margin: 0;
          padding: 0;
        }
        .header {
          border-bottom: 3px solid #10b981;
          padding-bottom: 8px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-title {
          font-size: 20px;
          font-weight: 800;
          color: #065f46;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 10.5px;
          color: #64748b;
          margin-top: 2px;
        }
        .meta-badge {
          text-align: right;
          font-size: 9.5px;
          color: #475569;
        }
        .section-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          background: #f1f5f9;
          padding: 5px 8px;
          border-left: 4px solid #10b981;
          margin-top: 14px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          page-break-after: avoid;
        }
        .grid-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 6px 8px;
        }
        .card-label {
          font-size: 8.5px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
        }
        .card-val {
          font-size: 11.5px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          font-size: 10px;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .total-row {
          background-color: #e2e8f0;
          font-weight: 800;
        }
        .timeline-item {
          border-left: 2px dashed #10b981;
          padding-left: 10px;
          margin-left: 5px;
          margin-bottom: 8px;
          position: relative;
          page-break-inside: avoid;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -5px;
          top: 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
        .tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
        }
        .source-tag {
          display: inline-block;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 8.5px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .source-farmer {
          background: #ecfdf5;
          color: #047857;
          border-color: #a7f3d0;
        }
        .rationale-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 10px;
          color: #064e3b;
          white-space: pre-line;
          margin-bottom: 10px;
          page-break-inside: avoid;
        }
        .weather-box {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          color: #0369a1;
          margin-bottom: 10px;
          page-break-inside: avoid;
        }
        .footer {
          margin-top: 16px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          page-break-inside: avoid;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header">
        <div>
          <div class="logo-title">🌱 AgriNova Smart Crop Nutrition Planner</div>
          <div class="subtitle">Official Field Nutrition & Crop Protection Schedule</div>
        </div>
        <div class="meta-badge">
          <div><b>Generated Date:</b> ${timestamp}</div>
          <div><b>Recommendation ID:</b> ${recId}</div>
        </div>
      </div>

      <!-- CROP & FARM SUMMARY -->
      <div class="grid-summary">
        <div class="card">
          <div class="card-label">Target Crop</div>
          <div class="card-val">${crop}</div>
        </div>
        <div class="card">
          <div class="card-label">Farm Size</div>
          <div class="card-val">${areaDisplay}</div>
        </div>
        <div class="card">
          <div class="card-label">Soil Type</div>
          <div class="card-val">${soilType}</div>
        </div>
        <div class="card">
          <div class="card-label">State / Season</div>
          <div class="card-val">${state} (${season})</div>
        </div>
      </div>

      <!-- NUTRIENT CLASSIFICATION & ANALYSIS MATRIX -->
      <div class="section-title">1. Soil Nutrient Status & Classification Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Value & Unit</th>
            <th>Source of Value</th>
            <th>Classification</th>
            <th>Crop Demand</th>
            <th>Deficit Supply</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          ${plan.nutrient_matrix ? Object.values(plan.nutrient_matrix).map(nItem => `
            <tr>
              <td><b>${nItem.label}</b></td>
              <td>${nItem.available_nutrient} ${nItem.unit}</td>
              <td>
                <span class="source-tag ${nItem.source === 'Farmer Input' ? 'source-farmer' : ''}">
                  ${nItem.source}
                </span>
              </td>
              <td><b>${nItem.classification}</b></td>
              <td>${nItem.crop_requirement} ${nItem.unit}</td>
              <td><b style="color: ${nItem.deficit > 0 ? '#b45309' : '#15803d'}">${nItem.deficit > 0 ? '+' + nItem.deficit + ' ' + nItem.unit : '0'}</b></td>
              <td style="font-size: 9.5px;">${nItem.recommended_action}</td>
            </tr>
          `).join('') : ['N', 'P', 'K', 'S', 'Zn', 'B'].map(nut => {
            const gap = plan.nutrient_gap?.[nut] || {};
            return `
              <tr>
                <td><b>${nut}</b></td>
                <td>${gap.available || 0} kg/ha</td>
                <td><span class="source-tag">Estimated</span></td>
                <td><b>${gap.status || 'Medium'}</b></td>
                <td>${gap.ideal || 0} kg/ha</td>
                <td><b>${gap.deficit || 0} kg/ha</b></td>
                <td>Satisfy crop requirement</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- MULTI-PLAN STRATEGIES -->
      <div class="section-title">2. Multiple Fertilizer Plan Options</div>
      <table>
        <thead>
          <tr>
            <th>Plan Strategy</th>
            <th>Description & Advantages</th>
            <th>Est. Nutrition Cost</th>
            <th>Suitability</th>
          </tr>
        </thead>
        <tbody>
          ${(plan.top_fertilizer_plans || []).map(p => `
            <tr>
              <td><b>${p.tag}</b><br><span style="font-size: 9px; color: #64748b;">${p.title}</span></td>
              <td>${p.description}</td>
              <td><b>${p.cost?.total_cost_display || '₹' + (p.cost?.total_cost || 0)}</b></td>
              <td><span class="tag">${p.score}% Match</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- SELECTED FERTILIZER PLAN ITEMS -->
      <div class="section-title">3. Selected Fertilizer Plan Breakdown (${selectedPlan.title || 'Balanced Plan'})</div>
      <table>
        <thead>
          <tr>
            <th>Fertilizer Product</th>
            <th>Grade / NPK</th>
            <th>Dose (kg/ha)</th>
            <th>Total Quantity Needed</th>
            <th>Market Price</th>
            <th>Estimated Cost</th>
            <th>Application Method</th>
          </tr>
        </thead>
        <tbody>
          ${(selectedPlan.items || []).map(item => `
            <tr>
              <td><b>${item.name}</b> (${item.type || 'Fertilizer'})</td>
              <td>${item.npk_ratio || 'Complex'}</td>
              <td>${item.dose_per_ha} kg</td>
              <td><b>${item.quantity_display?.total_text || (item.total_quantity_kg || item.total_kg || 0) + ' kg'}</b></td>
              <td>₹${item.cost_per_kg}/kg ${item.price_per_bag ? `(₹${item.price_per_bag}/bag)` : ''}</td>
              <td><b>${item.cost_display || '₹' + (item.item_cost || 0)}</b></td>
              <td>${item.application_method || 'Soil Application'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- STAGE-WISE APPLICATION TIMELINE -->
      <div class="section-title">4. Stage-Wise Application Timeline</div>
      ${(schedule || []).map(stg => `
        <div class="timeline-item">
          <div><b>${stg.stage}</b> — <span style="color: #047857; font-weight: 700;">${stg.timing}</span></div>
          <div style="color: #475569; font-size: 9px; margin-top: 1px;">Method: ${stg.application_method} | Split Ratio: N:${stg.nutrient_splits?.N_split_pct}% P:${stg.nutrient_splits?.P_split_pct}% K:${stg.nutrient_splits?.K_split_pct}%</div>
          <div style="margin-top: 3px;">
            ${(stg.fertilizers || []).map(f => `
              <span class="tag" style="margin-right: 4px;">• ${f.name}: ${f.quantity_display?.total_text || f.total_kg + ' kg'}</span>
            `).join('')}
          </div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;"><i>Note: ${stg.instructions}</i></div>
        </div>
      `).join('')}

      <!-- CROP PROTECTION SCHEDULE -->
      <div class="section-title">5. Integrated Crop Protection Plan</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Target Pest / Problem</th>
            <th>Recommended Product</th>
            <th>Dose per Acre</th>
            <th>Application Method</th>
            <th>Est. Cost / Acre</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ...(protection.weed_management || []),
            ...(protection.disease_prevention || []),
            ...(protection.pest_management || []),
            ...(protection.micronutrient_spray || []),
            ...(protection.growth_promoter || [])
          ].map(p => `
            <tr>
              <td><b>${p.category || 'Protection'}</b></td>
              <td>${p.problem}</td>
              <td><b>${p.recommended_product}</b> (${p.active_ingredient || ''})</td>
              <td>${p.dose_per_acre}</td>
              <td>${p.application_method}</td>
              <td>${p.cost_display || '₹' + (p.estimated_cost_per_acre || 0) + '/acre'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- WEATHER ADVISORY BOX -->
      ${weather.current_summary ? `
        <div class="weather-box">
          <b>🌤️ Real-Time Weather Integration Advisory:</b> ${weather.current_summary}
          ${(weather.advisories || []).map(a => `<div style="margin-top: 3px;">• <b>${a.title}:</b> ${a.message}</div>`).join('')}
        </div>
      ` : ''}

      <!-- COST BREAKDOWN -->
      <div class="section-title">6. Complete Cost Breakdown Summary</div>
      <table>
        <thead>
          <tr>
            <th>Cost Head</th>
            <th>Category</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fertilizer Cost</td>
            <td>Nutrition</td>
            <td>${costSummary.fertilizer_cost_display || '₹' + (costSummary.fertilizer_cost || 0)}</td>
          </tr>
          <tr>
            <td>Micronutrient & Secondary Cost</td>
            <td>Nutrition</td>
            <td>${costSummary.micronutrient_cost_display || '₹' + (costSummary.micronutrient_cost || 0)}</td>
          </tr>
          <tr>
            <td>Herbicide Cost</td>
            <td>Protection</td>
            <td>${costSummary.herbicide_cost_display || '₹' + (costSummary.herbicide_cost || 0)}</td>
          </tr>
          <tr>
            <td>Fungicide Cost</td>
            <td>Protection</td>
            <td>${costSummary.fungicide_cost_display || '₹' + (costSummary.fungicide_cost || 0)}</td>
          </tr>
          <tr>
            <td>Insecticide Cost</td>
            <td>Protection</td>
            <td>${costSummary.insecticide_cost_display || '₹' + (costSummary.insecticide_cost || 0)}</td>
          </tr>
          <tr>
            <td>Growth Regulator Cost</td>
            <td>Protection</td>
            <td>${costSummary.growth_regulator_cost_display || '₹' + (costSummary.growth_regulator_cost || 0)}</td>
          </tr>
          <tr>
            <td>Application Labour & Misc</td>
            <td>Operational</td>
            <td>${costSummary.application_cost_display || '₹' + (costSummary.application_cost || 0)}</td>
          </tr>
          <tr class="total-row">
            <td><b>GRAND TOTAL PLAN COST</b></td>
            <td><b>Nutrition + Protection</b></td>
            <td><b style="color: #047857; font-size: 12px;">${costSummary.grand_total_display || '₹' + (costSummary.grand_total || 0)}</b></td>
          </tr>
        </tbody>
      </table>

      <!-- AI SCIENTIFIC RATIONALE -->
      <div class="section-title">7. Scientific AI Plan Rationale</div>
      <div class="rationale-box">
        ${plan.ai_explanation?.full_explanation || 'Scientifically balanced plan generated using ICAR guidelines and linear programming.'}
      </div>

      <!-- IMPORTANT PRECAUTIONS -->
      <div class="section-title">8. Safety Warnings & Field Precautions</div>
      <ul style="padding-left: 16px; margin-top: 4px; font-size: 9px; color: #334155;">
        <li>Always wear protective mask, gloves, and boots during agrochemical mixing and spraying.</li>
        <li>Do NOT mix phosphatic fertilizers directly with Zinc Sulphate in the same spray tank to avoid precipitation.</li>
        <li>Apply Nitrogen fertilizers only when adequate soil moisture is present to minimize volatilization.</li>
        <li>Follow recommended Pre-Harvest Interval (PHI) after applying insecticides/fungicides.</li>
      </ul>

      <!-- FOOTER -->
      <div class="footer">
        AgriNova Smart Farming Platform • Advisory generated based on verified ICAR & KVK agronomic standards.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
};
