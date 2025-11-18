export class AddressService {
  constructor() {
    this.tableName = "x_1599224_online_d_address";
  }

  waitForGlobals() {
    return new Promise((resolve) => {
      const checkGlobals = () => {
        if (window.g_ck) {
          resolve();
        } else {
          setTimeout(checkGlobals, 100);
        }
      };
      checkGlobals();
    });
  }

  async getAddressesByCustomer(customerId) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.tableName}?sysparm_query=customer=${customerId}&sysparm_display_value=all`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const { result } = await response.json();
      return result || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  async createAddress(addressData) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create address');
      }

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(addressId, addressData) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.tableName}/${addressId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update address');
      }

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(addressId) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.tableName}/${addressId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  async setDefaultAddress(customerId, addressId) {
    try {
      // First, unset all addresses as default
      const addresses = await this.getAddressesByCustomer(customerId);
      for (const address of addresses) {
        const addrSysId = typeof address.sys_id === 'object' ? address.sys_id.value : address.sys_id;
        if (addrSysId !== addressId) {
          await this.updateAddress(addrSysId, { is_default: false });
        }
      }

      // Set the selected address as default
      return await this.updateAddress(addressId, { is_default: true });
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}