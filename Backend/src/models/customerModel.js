// src/models/customerModel.js
const pool = require("../config/db");

const CustomerModel = {
  async findByPhoneOrNationalId(phone, nationalId) {
    const [existing] = await pool.query(
      "SELECT customer_id FROM customers WHERE primary_phone = ? OR national_id_number = ?",
      [phone, nationalId],
    );
    return existing;
  },

  async create(customerData, agentId) {
    const query = `
            INSERT INTO customers (
                agent_id, first_name, middle_name, last_name, date_of_birth, gender, marital_status, father_name, mother_name,
                primary_phone, alternate_phone, email_address,
                current_address_line1, current_address_line2, current_city, current_state, current_pincode, residence_type,
                same_as_current, permanent_address_line1, permanent_city, permanent_state, permanent_pincode,
                family_type, total_family_members, earning_members_count, dependents_count,
                national_id_number, tax_id_number, voter_id_number,
                bank_name, branch_name, account_holder_name, account_number, ifsc_code,
                occupation_type, employer_or_business_name, work_experience_years,
                monthly_personal_income, monthly_household_income, primary_income_source,
                nominee_full_name, nominee_relationship, nominee_phone, nominee_dob,
                kyc_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

    const values = [
      agentId,
      customerData.first_name,
      customerData.middle_name || null,
      customerData.last_name,
      customerData.date_of_birth,
      customerData.gender,
      customerData.marital_status,
      customerData.father_name,
      customerData.mother_name,
      customerData.primary_phone,
      customerData.alternate_phone || null,
      customerData.email_address || null,
      customerData.current_address_line1,
      customerData.current_address_line2 || null,
      customerData.current_city,
      customerData.current_state,
      customerData.current_pincode,
      customerData.residence_type,
      customerData.same_as_current || false,
      customerData.permanent_address_line1 || null,
      customerData.permanent_city || null,
      customerData.permanent_state || null,
      customerData.permanent_pincode || null,
      customerData.family_type,
      customerData.total_family_members,
      customerData.earning_members_count,
      customerData.dependents_count,
      customerData.national_id_number,
      customerData.tax_id_number,
      customerData.voter_id_number || null,
      customerData.bank_name,
      customerData.branch_name,
      customerData.account_holder_name,
      customerData.account_number,
      customerData.ifsc_code,
      customerData.occupation_type,
      customerData.employer_or_business_name,
      customerData.work_experience_years,
      customerData.monthly_personal_income,
      customerData.monthly_household_income,
      customerData.primary_income_source,
      customerData.nominee_full_name,
      customerData.nominee_relationship,
      customerData.nominee_phone,
      customerData.nominee_dob,
    ];

    const [result] = await pool.query(query, values);
    return result.insertId;
  },

  async findAll(role, agentId) {
    let query = "SELECT * FROM customers";
    let params = [];

    if (role === "agent") {
      query += " WHERE agent_id = ?";
      params.push(agentId);
    }
    query += " ORDER BY created_at DESC";

    const [customers] = await pool.query(query, params);
    return customers;
  },

  async findById(customerId, role, agentId) {
    let query = "SELECT * FROM customers WHERE customer_id = ?";
    let params = [customerId];

    if (role === "agent") {
      query += " AND agent_id = ?";
      params.push(agentId);
    }

    const [customers] = await pool.query(query, params);
    return customers[0] || null;
  },
};

module.exports = CustomerModel;
