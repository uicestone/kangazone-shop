<template lang="pug">
  div
    v-app-bar( color="#6A76AB" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 订单列表
    v-container
      v-card.p-5
        v-form
          div(class="flex flex-col md:flex-row")
            v-select(label="类型" v-model="searchForm.type" :items="configs.bookingTypes" item-text="label" item-value="value" clearable)
            v-select(label="状态" v-model="searchForm.status" :items="configs.bookingStatus" item-text="label" item-value="value" clearable)
            v-text-field(label="关键词" v-model="searchForm.customerKeyword" clearable)
          div
            v-btn(@click="getBookings") 搜索
        

      div.pt-10
        v-data-table.pt-10(
          :headers="headers" 
          :items="items" 
          :items-per-page="20" 
          hide-default-footer 
          :loading="loading")
          template(v-slot:item.action="{item}")
            a(small @click="editBooking(item)") 编辑
        v-pagination(v-model="page" :length="total" total-visible="7")

        
</template>

<script>
import get from "lodash/get";
import { findBookings } from "../../services/booking";
import { sync } from "vuex-pathify";
import { _ } from "../../utils/lodash";
import { moment } from "../../utils/moment";

export default {
  data() {
    return {
      searchForm: {
        customerKeyword: null,
        due: null,
        date: null,
        status: null,
        type: null
      },
      editBookingItem: {
        customer: {}
      },
      showEditBooking: false,
      headers: [
        {
          text: "昵称",
          align: "left",
          value: "customer.name",
          sortable: false
        },
        {
          text: "手机号",
          align: "left",
          value: "customer.mobile"
        },
        {
          text: "状态",
          align: "left",
          value: "status",
          sortable: false
        },
        {
          text: "小时",
          align: "left",
          value: "hours"
        },
        {
          text: "类型",
          align: "left",
          value: "type",
          sortable: false
        },
        {
          text: "袜子数",
          align: "left",
          value: "socksCount"
        },
        {
          text: "人数",
          align: "left",
          value: "membersCount"
        },
        { text: "Actions", value: "action", sortable: false }
      ],
      items: [],
      loading: true,
      page: 1,
      total: 10,
      limit: 10
    };
  },
  computed: {
    configs: sync("configs")
  },
  mounted() {
    const { due, status, type, date } = this.$route.query;
    console.log(this.$route.query);
    this.searchForm = Object.assign({}, this.searchForm, _.omitBy({ due, status, type, date }, _.isNil));
    this.getBookings();
  },
  watch: {
    page(val) {
      this.getBookings();
    }
  },
  methods: {
    async getBookings() {
      this.loading = true;

      const {
        limit,
        page,
        searchForm: { status, type, customerKeyword, date, due }
      } = this;
      const skip = (page - 1) * limit;
      const res = await findBookings({ limit, skip: skip > 0 ? skip : 0, type, status, customerKeyword, date, due });
      const end = res.headers["items-end"];
      const start = res.headers["items-start"];
      const total = res.headers["items-total"];

      this.total = Math.round(total / limit);

      this.items = res.data;
      this.loading = false;
    },
    editBooking(item) {
      this.$router.push({ name: "bookingDetail", params: { id: item.id } });
    }
  }
};
</script>

<style>
</style>