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
            v-select.flex-1(label="状态" v-model="searchForm.status" :items="configs.bookingStatus" item-text="label" item-value="value" clearable)
            v-text-field.flex-1(label="手机 / 会员卡" v-model="searchForm.customerKeyword" clearable autocomplete="off")        
            v-text-field.flex-1(label="手环" v-model="searchForm.bandId" clearable autocomplete="off")        

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
          template(v-slot:item.customer="{item}")
            span {{item.customer.name}}
              span(v-if="item.customer.mobile") {{ item.customer.mobile.substr(-4) }}
          template(v-slot:item.status="{item}")
            span {{configs.bookingStatusMap[item.status]}}
          template(v-slot:item.type="{item}")
            span {{configs.bookingTypeMap[item.type]}}
          template(v-slot:item.hours="{item}")
            span {{item.hours ? item.hours : '畅玩'}}
          template(v-slot:item.coupon="{item}")
            span(v-if="item.coupon") {{configs.coupons.find(c => c.slug===item.coupon).name}}
            span(v-if="item.code") {{ item.code.title }}
            span(v-if="!item.code && !item.coupon") -
          template(v-slot:item.membersCount="{item}")
            span(v-if="item.membersCount") {{ `${item.membersCount}大` }}
            span(v-if="item.kidsCount") {{ `${item.kidsCount}小` }}
            span(v-if="item.socksCount") {{ `${item.socksCount}袜` }}
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
        bandId: null,
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
          text: "状态",
          align: "left",
          value: "status",
          sortable: false
        },
        {
          text: "客户",
          align: "left",
          value: "customer"
        },
        {
          text: "人数",
          align: "left",
          value: "membersCount"
        },
        {
          text: "入场时间",
          value: "checkInAt"
        },
        {
          text: "小时",
          align: "left",
          value: "hours"
        },
        {
          text: "优惠/券码",
          value: "coupon"
        }
        // {
        //   text: "日期",
        //   align: "left",
        //   value: "date"
        // },
        // {
        //   text: "类型",
        //   align: "left",
        //   value: "type",
        //   sortable: false
        // }
        // {
        //   text: "袜子数",
        //   align: "left",
        //   value: "socksCount"
        // },
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
    // console.log(this.$route.query);
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
        searchForm: { status, type, customerKeyword, bandId, date, due }
      } = this;
      const skip = (page - 1) * limit;
      const res = await findBookings({ limit, skip: skip > 0 ? skip : 0, type, status, customerKeyword, bandId, date, due });
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
    position relative
    > .v-progress-linear
      position absolute
.v-pagination
  >>> .v-pagination__item, >>> .v-pagination__navigation
    height 24px
  >>> .v-pagination__navigation .v-icon
    font-size 1.5rem
</style>