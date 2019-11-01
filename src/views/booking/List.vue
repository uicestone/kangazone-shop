<template lang="pug">
  div.flex.flex-column
    v-app-bar(color="primary" dark)
      v-app-bar-nav-icon(@click="$router.go(-1)")
        v-icon mdi-chevron-left
      v-toolbar-title 订单列表
    v-container.pb-1
      v-card.px-3.py-1
        v-form
          div(class="flex md:flex-row")
            v-select(label="类型" v-model="searchForm.type" :items="configs.bookingTypes" item-text="label" item-value="value" clearable)
            v-select(label="状态" v-model="searchForm.status" :items="configs.bookingStatus" item-text="label" item-value="value" clearable)
            v-text-field(label="用户手机/卡号" v-model="searchForm.customerKeyword" clearable autocomplete="off")        

      div.pt-2
        v-data-table.p-3(
          :headers="headers" 
          :items="items" 
          :items-per-page="7" 
          hide-default-footer 
          :loading="loading"
          loading-text="正在载入"
          no-data-text="没有数据"
          @click:row="editBooking"
          )
          template(v-slot:item.status="{item}")
            span {{configs.bookingStatusMap[item.status]}}
          template(v-slot:item.type="{item}")
            span {{configs.bookingTypeMap[item.type]}}
          template(v-slot:item.hours="{item}")
            span {{item.hours ? item.hours : '畅玩'}}
          template(v-slot:item.membersCount="{item}")
            span(v-if="item.membersCount") {{ `${item.membersCount}大` }}
            span(v-if="item.kidsCount") {{ `${item.kidsCount}小` }}
        v-pagination(v-model="page" :length="totalPages" :total-visible="5")
         
            

        
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
        type: "play"
      },
      searchDelayTimeout: null,
      editBookingItem: {
        customer: {}
      },
      showEditBooking: false,
      headers: [
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
          text: "日期",
          align: "left",
          value: "date"
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
        // {
        //   text: "袜子数",
        //   align: "left",
        //   value: "socksCount"
        // },
        {
          text: "人数",
          align: "left",
          value: "membersCount"
        }
      ],
      items: [],
      loading: true,
      page: 1,
      totalPages: null,
      limit: 7
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
    },
    searchForm: {
      deep: true,
      handler() {
        clearTimeout(this.searchDelayTimeout);
        this.searchDelayTimeout = setTimeout(() => {
          this.getBookings();
        }, 500);
      }
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

      this.totalPages = Math.ceil(total / limit);

      this.items = res.data;
      this.loading = false;
    },
    editBooking(item) {
      this.$router.push({ name: "bookingDetail", params: { id: item.id } });
    }
  }
};
</script>

<style lang="stylus" scoped>
.v-data-table
  >>> td, >>> th
    padding 6px 8px
    height auto
  >>> .v-data-table__progress > th
    padding 0
.v-pagination
  >>> .v-pagination__item, >>> .v-pagination__navigation
    height 24px
  >>> .v-pagination__navigation .v-icon
    font-size 1.5rem
</style>