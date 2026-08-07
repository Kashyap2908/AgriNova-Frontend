/**
 * PDF / Printable Field Schedule Generator
 * Generates a clean, professional, field-ready PDF document for farmers across 11 numbered sections.
 */

export const generatePlanPDF = (plan) => {
  if (!plan) return;

  const crop = plan.crop_summary?.crop || 'Crop';
  const areaDisplay = plan.crop_summary?.area_display || `${plan.crop_summary?.farm_area || 1} ${plan.crop_summary?.area_unit || 'Acres'}`;
  const soilType = plan.crop_summary?.soil_type || 'Loamy';
  const state = plan.crop_summary?.state || 'India';
  const season = plan.crop_summary?.season || 'Kharif';
  const prevCrop = plan.crop_summary?.previous_crop || 'None';
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const selectedPlan = plan.top_fertilizer_plans?.[0] || {};
  const schedule = plan.selected_plan_schedule || plan.stage_schedule || [];
  const protection = plan.protection_plan || {};
  const weather = plan.weather_advisory || {};
  const costSummary = plan.cost_summary || {};
  const precautions = plan.important_precautions || [
    "Wear protective gloves, eye goggles, and a mask while mixing and spraying agrochemicals.",
    "Maintain a Pre-Harvest Interval (PHI) of at least 14 days after chemical spray before harvesting crops.",
    "Never mix organophosphate insecticides with alkaline fertilizers (such as Lime or Calcium Nitrate).",
    "Ensure adequate soil moisture before broadcasting granular fertilizers (Urea/DAP/MOP) to prevent root scorching.",
    "Store remaining fertilizers and pesticides in a cool, dry, locked shed away from children and animals."
  ];

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
          margin: 8mm 10mm;
        }
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.4;
          font-size: 10px;
          margin: 0;
          padding: 0;
        }
        .header {
          border-bottom: 3px solid #10b981;
          padding-bottom: 6px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-title {
          font-size: 18px;
          font-weight: 800;
          color: #065f46;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 10px;
          color: #64748b;
          margin-top: 1px;
        }
        .meta-badge {
          text-align: right;
          font-size: 9px;
          color: #475569;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          background: #f1f5f9;
          padding: 4px 8px;
          border-left: 4px solid #10b981;
          margin-top: 10px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          page-break-after: avoid;
        }
        .grid-summary {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          margin-bottom: 10px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 4px 6px;
        }
        .card-label {
          font-size: 8px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
        }
        .card-val {
          font-size: 10.5px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 9.5px;
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
          padding-left: 8px;
          margin-left: 4px;
          margin-bottom: 6px;
          position: relative;
          page-break-inside: avoid;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -4px;
          top: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
        }
        .tag {
          display: inline-block;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 8.5px;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
        }
        .source-tag {
          display: inline-block;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 8px;
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
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 9.5px;
          color: #064e3b;
          white-space: pre-line;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        .weather-box {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 9.5px;
          color: #0369a1;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        .footer {
          margin-top: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          font-size: 8.5px;
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
          <div class="subtitle">Official Field Nutrition & Crop Protection Advisory</div>
        </div>
        <div class="meta-badge">
          <div><b>Generated Date:</b> ${timestamp}</div>
          <div><b>Recommendation ID:</b> ${recId}</div>
        </div>
      </div>

      <!-- SECTION 1: CROP SUMMARY -->
      <div class="section-title">1. Crop Summary</div>
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
          <div class="card-label">State</div>
          <div class="card-val">${state}</div>
        </div>
        <div class="card">
          <div class="card-label">Season</div>
          <div class="card-val">${season}</div>
        </div>
        <div class="card">
          <div class="card-label">Previous Crop</div>
          <div class="card-val">${prevCrop}</div>
        </div>
      </div>

      <!-- SECTION 2: SOIL SUMMARY -->
      <div class="section-title">2. Soil Summary</div>
      <div class="rationale-box" style="background: #f8fafc; border-color: #cbd5e1; color: #334155;">
        <b>Analysis Baseline:</b> ${plan.soil_summary?.mode === 'PRECISION' ? 'Laboratory Soil Health Card Test Values (Precision Mode)' : `Estimated Regional ICAR Baseline for ${soilType} soil in ${state}`}.
        <br><b>Soil Parameters:</b> pH ${plan.soil_summary?.soil_nutrients?.pH || 7.0} • Organic Carbon ${plan.soil_summary?.soil_nutrients?.OC || 0.75}% • Electrical Conductivity ${plan.soil_summary?.soil_nutrients?.EC || 0.45} dS/m
      </div>

      <!-- SECTION 3: NUTRIENT STATUS -->
      <div class="section-title">3. Nutrient Status & Classification Matrix</div>
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
              <td style="font-size: 9px;">${nItem.recommended_action}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <!-- SECTION 4: FERTILIZER PLANS -->
      <div class="section-title">4. Fertilizer Plans (Options)</div>
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
              <td><b>${p.tag}</b><br><span style="font-size: 8.5px; color: #64748b;">${p.title}</span></td>
              <td>${p.description}</td>
              <td><b>${p.cost?.total_cost_display || '₹' + (p.cost?.total_cost || 0)}</b></td>
              <td><span class="tag">${p.score}% Match</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- SECTION 5: SELECTED PLAN -->
      <div class="section-title">5. Selected Plan Breakdown (${selectedPlan.title || 'Balanced Plan'})</div>
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

      <!-- SECTION 6: STAGE-WISE APPLICATION SCHEDULE -->
      <div class="section-title">6. Stage-Wise Application Schedule</div>
      ${(schedule || []).map(stg => `
        <div class="timeline-item">
          <div><b>${stg.stage}</b> — <span style="color: #047857; font-weight: 700;">${stg.timing}</span></div>
          <div style="color: #475569; font-size: 8.5px; margin-top: 1px;">Method: ${stg.application_method} | Split Ratio: N:${stg.nutrient_splits?.N_split_pct}% P:${stg.nutrient_splits?.P_split_pct}% K:${stg.nutrient_splits?.K_split_pct}%</div>
          <div style="margin-top: 2px;">
            ${(stg.fertilizers || []).map(f => `
              <span class="tag" style="margin-right: 4px;">• ${f.name}: ${f.quantity_display?.total_text || f.total_kg + ' kg'}</span>
            `).join('')}
          </div>
          <div style="font-size: 8.5px; color: #64748b; margin-top: 1px;"><i>Note: ${stg.instructions}</i></div>
        </div>
      `).join('')}

      <!-- SECTION 7: CROP PROTECTION PLAN -->
      <div class="section-title">7. Crop Protection Plan</div>
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
              <td><b>${p.recommended_product}</b> ${p.active_ingredient && p.active_ingredient !== 'N/A' ? `(${p.active_ingredient})` : ''}</td>
              <td>${p.dose_per_acre}</td>
              <td>${p.application_method}</td>
              <td>${p.cost_display || '₹' + (p.estimated_cost_per_acre || 0) + '/acre'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- SECTION 8: WEATHER ADVISORY -->
      <div class="section-title">8. Weather Advisory</div>
      <div class="weather-box">
        <b>🌤️ Weather Status:</b> ${weather.current_summary || 'Baseline weather active.'}
        ${(weather.advisories || []).map(a => `<div style="margin-top: 2px;">• <b>${a.title}:</b> ${a.message}</div>`).join('')}
      </div>

      <!-- SECTION 9: COST BREAKDOWN -->
      <div class="section-title">9. Cost Breakdown</div>
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
            <td><b style="color: #047857; font-size: 11px;">${costSummary.grand_total_display || '₹' + (costSummary.grand_total || 0)}</b></td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 10: AI EXPLANATION -->
      <div class="section-title">10. AI Explanation</div>
      <div class="rationale-box">
        ${plan.ai_explanation?.full_explanation || 'Scientifically balanced plan generated using ICAR guidelines and linear programming optimization.'}
      </div>

      <!-- SECTION 11: IMPORTANT PRECAUTIONS -->
      <div class="section-title">11. Important Precautions</div>
      <ul style="padding-left: 16px; margin-top: 4px; font-size: 9px; color: #334155;">
        ${precautions.map(prec => `<li>${prec}</li>`).join('')}
      </ul>

      <!-- FOOTER -->
      <div class="footer">
        AgriNova Smart Farming Platform • Advisory generated based on ICAR & KVK agronomic standards.
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
